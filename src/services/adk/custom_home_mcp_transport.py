"""
Custom MCP transport for non-standard SSE implementations like CustomHomeMCP/Windmill.

These servers use isolated request/response pairs (POST → response → close)
instead of maintaining a persistent SSE stream like standard MCP servers.
"""

import logging
from contextlib import asynccontextmanager
from typing import Any

import anyio
import httpx
from anyio.streams.memory import MemoryObjectReceiveStream, MemoryObjectSendStream
from mcp.shared.message import SessionMessage
from mcp.types import JSONRPCMessage

logger = logging.getLogger(__name__)


@asynccontextmanager
async def custom_home_mcp_client(
    url: str,
    headers: dict[str, Any] | None = None,
    timeout: float = 3600,  # 1 hour default for security tools
):
    """
    Custom transport for CustomHomeMCP servers and similar hybrid implementations.

    Standard: POST -> SSE response -> close
    Hybrid: POST (/message) -> JSON response (sync) or SSE response
    """
    read_stream: MemoryObjectReceiveStream[SessionMessage | Exception]
    read_stream_writer: MemoryObjectSendStream[SessionMessage | Exception]

    write_stream: MemoryObjectSendStream[SessionMessage]
    write_stream_reader: MemoryObjectReceiveStream[SessionMessage]

    read_stream_writer, read_stream = anyio.create_memory_object_stream(0)
    write_stream, write_stream_reader = anyio.create_memory_object_stream(0)

    # Determine if this is a custom server pattern (/mcp/mcp_)
    is_custom_mcp = "/mcp/mcp_" in url

    try:
        async with anyio.create_task_group() as tg:
            try:
                # Redact token from URL for logging
                log_url = url.split("?")[0] + "?token=***" if "token=" in url else url
                logger.debug(f"Starting MCP transport for: {log_url}")

                async def request_handler():
                    try:
                        # Increased keepalive and timeout for stability
                        limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)
                        async with httpx.AsyncClient(limits=limits) as client:
                            async with write_stream_reader:
                                async for session_message in write_stream_reader:
                                    logger.debug(f"Sending MCP request: {session_message.message}")

                                    # Prepare request
                                    json_payload = session_message.message.model_dump(
                                        by_alias=True,
                                        mode="json",
                                        exclude_none=True,
                                    )

                                    # For custom servers, update URL to use /message instead of /sse if needed
                                    post_url = url
                                    if is_custom_mcp and "/sse" in url:
                                        post_url = url.replace("/sse", "/message")

                                    request_headers = {
                                        "Accept": "application/json, text/event-stream",
                                        "Content-Type": "application/json",
                                    }
                                    if headers:
                                        request_headers.update(headers)

                                    try:
                                        logger.debug(
                                            f"Sending request to {post_url}: {json_payload.get('method', 'unknown')}"
                                        )
                                        response = await client.post(
                                            post_url,
                                            json=json_payload,
                                            headers=request_headers,
                                            # Large read timeout for long tool executions
                                            timeout=httpx.Timeout(
                                                timeout, read=timeout, connect=60.0
                                            ),
                                        )
                                        response.raise_for_status()

                                        content_type = response.headers.get("content-type", "")

                                        # Handle direct JSON response (Synchronous JSON-RPC)
                                        if "application/json" in content_type:
                                            try:
                                                data = response.json()
                                                logger.debug(
                                                    f"Parsed direct JSON-RPC response: {data}"
                                                )

                                                try:
                                                    message = JSONRPCMessage.model_validate(data)
                                                    await read_stream_writer.send(
                                                        SessionMessage(message)
                                                    )
                                                except Exception as validation_exc:
                                                    # Check if it's an error response with null ID (common issue)
                                                    if isinstance(data, dict) and "error" in data:
                                                        logger.warning(
                                                            f"Validation failed for error response: {validation_exc}. Trying to patch ID."
                                                        )
                                                        # If ID is missing or None, and it's an error, it might be acceptable in some contexts or we can patch it
                                                        if data.get("id") is None:
                                                            # Try to assign a dummy ID or the request ID if we tracked it (we didn't track it here strictly)
                                                            # But for now, let's just log and maybe not kill the stream if it's just a protocol mismatch
                                                            pass

                                                    # If the request was a notification, we can ignore response validation errors
                                                    # We determine if it was a notification by checking the payload sent
                                                    is_notification = (
                                                        isinstance(json_payload, dict)
                                                        and "method" in json_payload
                                                        and "id" not in json_payload
                                                    )

                                                    if is_notification:
                                                        logger.warning(
                                                            f"Ignoring validation error for notification response: {validation_exc}"
                                                        )
                                                    else:
                                                        logger.error(
                                                            f"Error validating JSON-RPC response: {validation_exc}. Data: {data}"
                                                        )
                                                        await read_stream_writer.send(
                                                            validation_exc
                                                        )

                                            except Exception as exc:
                                                logger.error(
                                                    f"Error parsing direct JSON response: {exc}"
                                                )
                                                await read_stream_writer.send(exc)

                                        # Handle SSE response (Windmill style)
                                        else:
                                            content = response.text
                                            for line in content.split("\n"):
                                                if line.startswith("data: "):
                                                    data = line[6:]
                                                    try:
                                                        message = (
                                                            JSONRPCMessage.model_validate_json(data)
                                                        )
                                                        logger.debug(
                                                            f"Parsed SSE JSON-RPC response: {message}"
                                                        )
                                                        await read_stream_writer.send(
                                                            SessionMessage(message)
                                                        )
                                                    except Exception as exc:
                                                        logger.error(
                                                            f"Error parsing SSE response: {exc}. Data: {data}"
                                                        )
                                                        await read_stream_writer.send(exc)
                                                    break

                                    except httpx.HTTPStatusError as exc:
                                        logger.error(f"HTTP error: {exc}")
                                        await read_stream_writer.send(exc)
                                        # Critical error, stop this handler and close stream
                                        break
                                    except Exception as exc:
                                        logger.error(f"Error in request: {exc}")
                                        await read_stream_writer.send(exc)
                                        # For other errors, we might want to continue, but for custom transport
                                        # usually one failure means it's broken
                                        break

                    except Exception as exc:
                        logger.debug(f"Request handler finished: {exc}")
                    finally:
                        await read_stream_writer.aclose()

                tg.start_soon(request_handler)

                try:
                    yield read_stream, write_stream
                finally:
                    tg.cancel_scope.cancel()
            except anyio.get_cancelled_exc_class():
                raise
            except Exception as exc:
                logger.debug(f"Error in MCP client context: {exc}")
                raise

    except (RuntimeError, anyio.get_cancelled_exc_class()) as exc:
        logger.debug(f"MCP transport closed: {exc}")
    finally:
        await read_stream_writer.aclose()
        await write_stream.aclose()


def is_custom_home_mcp(url: str) -> bool:
    """
    Detect if URL is a CustomHomeMCP endpoint or similar custom pattern.

    Args:
        url: MCP server URL

    Returns:
        True if URL appears to require custom transport
    """
    url_lower = url.lower()
    return any(
        indicator in url_lower
        for indicator in [
            "windmill",
            "trigger.superlab.app",
            "/api/mcp/w/",
            "/mcp/mcp_",  # Custom server pattern
        ]
    )
