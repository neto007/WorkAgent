import os
from contextlib import AsyncExitStack
from typing import Any

from google.adk.tools.mcp_tool.mcp_toolset import (
    MCPToolset,
    SseServerParams,
    StdioServerParameters,
)
from sqlalchemy.orm import Session

from src.services.mcp_server_service import get_mcp_server
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class MCPService:
    def __init__(self):
        self.tools = []
        self.exit_stack = AsyncExitStack()

    async def _connect_to_mcp_server(
        self, server_config: dict[str, Any]
    ) -> tuple[list[Any], AsyncExitStack | None]:
        """Connect to a specific MCP server and return its tools."""
        try:
            # Determina o tipo de servidor (local ou remoto)
            if "url" in server_config:
                url = server_config["url"]
                # Correção automática para Cloudflare Tunnel (remove a porta 8000 que costuma ser erro de input)
                if "trycloudflare.com:8000" in url:
                    url = url.replace(":8000", "")
                    logger.info(f"Auto-fixed Cloudflare URL: {server_config['url']} -> {url}")
                    server_config["url"] = url

                headers = server_config.get("headers", {})

                # Extrai token da URL se presente
                url_token = None
                if "token=" in url:
                    import urllib.parse

                    parsed_url = urllib.parse.urlparse(url)
                    url_params = urllib.parse.parse_qs(parsed_url.query)
                    if "token" in url_params:
                        url_token = url_params["token"][0]

                # Sincronização bidirecional de autenticação:
                # 1. Se tem token na URL mas não no Header, injeta no Header
                if url_token and "Authorization" not in headers:
                    headers["Authorization"] = f"Bearer {url_token}"
                    server_config["headers"] = headers
                    logger.debug("Auto-injected token from URL into Authorization header")

                # 2. Se tem token no Header mas não na URL, injeta na URL (necessário para alguns transportes)
                elif "Authorization" in headers and not url_token:
                    auth_val = headers["Authorization"]
                    if auth_val.startswith("Bearer "):
                        token = auth_val.replace("Bearer ", "")
                        separator = "&" if "?" in url else "?"
                        url = f"{url}{separator}token={token}"
                        server_config["url"] = url
                        logger.debug("Auto-injected token from headers into URL query param")

                connection_params = SseServerParams(url=url, headers=headers)
            else:
                # Local server (Stdio)
                command = server_config.get("command", "npx")
                args = server_config.get("args", [])

                # Adds environment variables if specified
                env = server_config.get("env", {})
                if env:
                    for key, value in env.items():
                        os.environ[key] = value

                connection_params = StdioServerParameters(command=command, args=args, env=env)

            # Check if this is a CustomHomeMCP server (non-standard SSE pattern)
            from mcp.client.session import ClientSession

            from src.services.adk.custom_home_mcp_transport import (
                custom_home_mcp_client,
                is_custom_home_mcp,
            )

            if "url" in server_config and is_custom_home_mcp(server_config["url"]):
                # Redact token from URL for logging
                log_url = (
                    server_config["url"].split("?")[0] + "?token=***"
                    if "token=" in server_config["url"]
                    else server_config["url"]
                )
                logger.debug(f"🚀 DETECTED CUSTOM HOME MCP SERVER: {log_url}")
                logger.debug("Using custom transport (hybrid JSON/SSE pattern)")

                # Use custom transport for CustomHomeMCP
                exit_stack = AsyncExitStack()
                client_context = custom_home_mcp_client(
                    url=server_config["url"],
                    headers=server_config.get("headers", {}),
                    # Tools discovery should be fast, but give some room for many tools
                    timeout=300,
                )
                transports = await exit_stack.enter_async_context(client_context)
                session = await exit_stack.enter_async_context(ClientSession(*transports))
                await session.initialize()

                # List tools from the session with pagination
                all_mcp_tools = []
                cursor = None
                page_count = 0
                while True:
                    page_count += 1
                    logger.debug(f"Fetching MCP tools page {page_count} (cursor={cursor})...")
                    tools_result = await session.list_tools(cursor=cursor)
                    batch_size = len(tools_result.tools)
                    all_mcp_tools.extend(tools_result.tools)

                    cursor = tools_result.nextCursor
                    logger.debug(
                        f"Page {page_count} received {batch_size} tools. Next cursor: {cursor}"
                    )

                    if not cursor:
                        break

                    # Safety break to prevent infinite loops if server is broken
                    if page_count > 50:
                        logger.warning("Reached 50 pages limit, stopping pagination safety break.")
                        break

                from google.adk.tools.mcp_tool import MCPTool

                tools = [
                    MCPTool(
                        mcp_tool=tool,
                        mcp_session=session,
                        mcp_session_manager=None,  # Not using session manager for CustomHomeMCP
                    )
                    for tool in all_mcp_tools
                ]

                logger.debug(
                    f"Retrieved {len(all_mcp_tools)} tools from CustomHomeMCP (after pagination)"
                )

                return tools, exit_stack
            else:
                # Use standard MCPToolset for stdio and standard SSE servers
                logger.debug("Using standard MCP transport (MCPToolset)")
                tools, exit_stack = await MCPToolset.from_server(
                    connection_params=connection_params
                )
                return tools, exit_stack

        except Exception as e:
            logger.error(f"Error connecting to MCP server: {e}")
            raise

    def _filter_incompatible_tools(self, tools: list[Any]) -> list[Any]:
        """Filters incompatible tools with the model."""
        problematic_tools = [
            "create_pull_request_review",  # This tool causes the 400 INVALID_ARGUMENT error
        ]

        filtered_tools = []
        removed_count = 0

        for tool in tools:
            if tool.name in problematic_tools:
                logger.warning(f"Removing incompatible tool: {tool.name}")
                removed_count += 1
            else:
                filtered_tools.append(tool)

        if removed_count > 0:
            logger.warning(f"Removed {removed_count} incompatible tools.")

        return filtered_tools

    def _filter_tools_by_agent(self, tools: list[Any], agent_tools: list[str]) -> list[Any]:
        """Filters tools compatible with the agent."""
        if not agent_tools or len(agent_tools) == 0:
            return tools

        filtered_tools = []
        logger.debug(
            f"Filtering tools debug. Requested: {agent_tools}. Available Examples: {[t.name for t in tools[:3]]}"
        )

        for tool in tools:
            tool_name = tool.name

            # 1. Exact match
            if tool_name in agent_tools:
                filtered_tools.append(tool)
                continue

            # 2. Case-insensitive match
            if any(tool_name.lower() == req.lower() for req in agent_tools):
                filtered_tools.append(tool)
                continue

            # 3. Suffix match (handle specific namespaces like Windmill 'w/workspace/script')
            # Check if the tool name ends with '/requested_name'
            if any(tool_name.endswith(f"/{req}") for req in agent_tools):
                filtered_tools.append(tool)
                continue

        if len(filtered_tools) == 0 and len(tools) > 0:
            import difflib

            logger.warning(f"No tools matched! Requested {len(agent_tools)} tools: {agent_tools}")

            # Suggest close matches
            all_tool_names = [t.name for t in tools]
            for req in agent_tools:
                matches = difflib.get_close_matches(req, all_tool_names, n=3, cutoff=0.4)
                if matches:
                    logger.warning(f"Did you mean one of these for '{req}'? {matches}")

            logger.warning(f"DEBUG: All {len(tools)} available tools: {all_tool_names}")

        return filtered_tools

    async def build_tools(
        self, mcp_config: dict[str, Any], db: Session
    ) -> tuple[list[Any], AsyncExitStack]:
        """Builds a list of tools from multiple MCP servers."""
        self.tools = []
        self.exit_stack = AsyncExitStack()

        try:
            mcp_servers = mcp_config.get("mcp_servers", [])
            if mcp_servers is not None:
                # Process each MCP server in the configuration
                for server in mcp_servers:
                    try:
                        # Search for the MCP server in the database
                        mcp_server = get_mcp_server(db, server["id"])
                        if not mcp_server:
                            logger.warning(f"MCP Server not found: {server['id']}")
                            continue

                        # Prepares the server configuration
                        server_config = mcp_server.config_json.copy()

                        # Replaces the environment variables in the config_json
                        if "env" in server_config and server_config["env"] is not None:
                            for key, value in server_config["env"].items():
                                if value and value.startswith("env@@"):
                                    env_key = value.replace("env@@", "")
                                    if server.get("envs") and env_key in server.get("envs", {}):
                                        server_config["env"][key] = server["envs"][env_key]
                                    else:
                                        logger.warning(
                                            f"Environment variable '{env_key}' not provided for the MCP server {mcp_server.name}"
                                        )
                                        continue

                        logger.debug(f"Connecting to MCP server: {mcp_server.name}")
                        tools, exit_stack = await self._connect_to_mcp_server(server_config)

                        if tools and exit_stack:
                            # Filters incompatible tools
                            filtered_tools = self._filter_incompatible_tools(tools)

                            # Filters tools compatible with the agent
                            agent_tools = server.get("tools", [])
                            if agent_tools:
                                filtered_tools = self._filter_tools_by_agent(
                                    filtered_tools, agent_tools
                                )
                            self.tools.extend(filtered_tools)

                            # Registers the exit_stack with the AsyncExitStack
                            await self.exit_stack.enter_async_context(exit_stack)
                            logger.debug(
                                f"MCP Server {mcp_server.name} connected successfully. Added {len(filtered_tools)} tools."
                            )
                        else:
                            logger.warning(
                                f"Failed to connect or no tools available for {mcp_server.name}"
                            )

                    except Exception as e:
                        logger.error(
                            f"Error connecting to MCP server {server.get('id', 'unknown')}: {e}"
                        )
                        continue

            custom_mcp_servers = mcp_config.get("custom_mcp_servers", [])
            if custom_mcp_servers is not None:
                # Process custom MCP servers
                for server in custom_mcp_servers:
                    if not server:
                        logger.warning("Empty server configuration found in custom_mcp_servers")
                        continue

                    try:
                        logger.debug(
                            f"Connecting to custom MCP server: {server.get('url', 'unknown')}"
                        )
                        tools, exit_stack = await self._connect_to_mcp_server(server)

                        if tools:
                            self.tools.extend(tools)
                        else:
                            logger.warning("No tools returned from custom MCP server")
                            continue

                        if exit_stack:
                            await self.exit_stack.enter_async_context(exit_stack)
                            logger.debug(
                                f"Custom MCP server connected successfully. Added {len(tools)} tools."
                            )
                        else:
                            logger.warning("No exit_stack returned from custom MCP server")
                    except Exception as e:
                        logger.error(
                            f"Error connecting to custom MCP server {server.get('url', 'unknown')}: {e}"
                        )
                        continue

            logger.debug(f"MCP Toolset created successfully. Total of {len(self.tools)} tools.")

        except Exception as e:
            # Ensure cleanup
            await self.exit_stack.aclose()
            logger.error(f"Fatal error connecting to MCP servers: {e}")
            # Recreate an empty exit_stack
            self.exit_stack = AsyncExitStack()

        return self.tools, self.exit_stack
