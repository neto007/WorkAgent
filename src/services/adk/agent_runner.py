from google.adk.runners import Runner
from google.genai.types import Content, Part, Blob
from google.adk.sessions import DatabaseSessionService
from google.adk.memory import InMemoryMemoryService
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
from src.utils.logger import setup_logger
from src.core.exceptions import AgentNotFoundError, InternalServerError
from src.services.agent_service import get_agent
from src.services.adk.agent_builder import AgentBuilder
from sqlalchemy.orm import Session
from typing import Optional, AsyncGenerator
import asyncio
import json
from src.utils.otel import get_tracer
from opentelemetry import trace
import base64

logger = setup_logger(__name__)


async def run_agent(
    agent_id: str,
    external_id: str,
    message: str,
    session_service: DatabaseSessionService,
    artifacts_service: InMemoryArtifactService,
    memory_service: InMemoryMemoryService,
    db: Session,
    session_id: Optional[str] = None,
    timeout: float = 3600.0,
    files: Optional[list] = None,
):
    tracer = get_tracer()
    with tracer.start_as_current_span(
        "run_agent",
        attributes={
            "agent_id": agent_id,
            "external_id": external_id,
            "session_id": session_id or f"{external_id}_{agent_id}",
            "message": message,
            "has_files": files is not None and len(files) > 0,
        },
    ):
        exit_stack = None
        try:
            logger.info(
                f"Starting execution of agent {agent_id} for external_id {external_id}"
            )
            logger.debug(f"Received message: {message}")

            if files and len(files) > 0:
                logger.info(f"Received {len(files)} files with message")

            get_root_agent = get_agent(db, agent_id)
            logger.debug(
                f"Root agent found: {get_root_agent.name} (type: {get_root_agent.type})"
            )

            if get_root_agent is None:
                raise AgentNotFoundError(f"Agent with ID {agent_id} not found")

            # Using the AgentBuilder to create the agent
            agent_builder = AgentBuilder(db)
            root_agent, exit_stack = await agent_builder.build_agent(get_root_agent)

            logger.debug("Configuring Runner")
            agent_runner = Runner(
                agent=root_agent,
                app_name=agent_id,
                session_service=session_service,
                artifact_service=artifacts_service,
                memory_service=memory_service,
            )
            adk_session_id = f"{external_id}_{agent_id}"
            if session_id is None:
                session_id = adk_session_id

            logger.debug(f"Searching session for external_id {external_id}")
            session = session_service.get_session(
                app_name=agent_id,
                user_id=external_id,
                session_id=adk_session_id,
            )

            if session is None:
                logger.debug(f"Creating new session for external_id {external_id}")
                session = session_service.create_session(
                    app_name=agent_id,
                    user_id=external_id,
                    session_id=adk_session_id,
                )

            file_parts = []
            if files and len(files) > 0:
                for file_data in files:
                    try:
                        file_bytes = base64.b64decode(file_data.data)

                        logger.debug(f"Processing file: {file_data.filename}")
                        logger.debug(f"File size: {len(file_bytes)} bytes")
                        logger.debug(f"MIME type: '{file_data.content_type}'")
                        logger.debug(f"First 20 bytes: {file_bytes[:20]}")

                        try:
                            file_part = Part(
                                inline_data=Blob(
                                    mime_type=file_data.content_type, data=file_bytes
                                )
                            )
                            logger.debug(f"Part created successfully")
                        except Exception as part_error:
                            logger.error(
                                f"DEBUG - Error creating Part: {str(part_error)}"
                            )
                            logger.error(
                                f"DEBUG - Error type: {type(part_error).__name__}"
                            )
                            import traceback

                            logger.error(
                                f"DEBUG - Stack trace: {traceback.format_exc()}"
                            )
                            raise

                        # Save the file in the ArtifactService
                        version = artifacts_service.save_artifact(
                            app_name=agent_id,
                            user_id=external_id,
                            session_id=adk_session_id,
                            filename=file_data.filename,
                            artifact=file_part,
                        )
                        logger.info(
                            f"Saved file {file_data.filename} as version {version}"
                        )

                        # Add the Part to the list of parts for the message content
                        file_parts.append(file_part)
                    except Exception as e:
                        logger.error(
                            f"Error processing file {file_data.filename}: {str(e)}"
                        )

            # Create the content with the text message and the files
            parts = [Part(text=message)]
            if file_parts:
                parts.extend(file_parts)

            content = Content(role="user", parts=parts)
            logger.info("Starting agent execution")

            final_response_text = "No final response captured."
            message_history = []

            try:
                response_queue = asyncio.Queue()
                execution_completed = asyncio.Event()

                async def process_events():
                    try:
                        events_async = agent_runner.run_async(
                            user_id=external_id,
                            session_id=adk_session_id,
                            new_message=content,
                        )

                        last_response = None
                        all_responses = []

                        async for event in events_async:
                            if event.content and event.content.parts:
                                event_dict = event.model_dump()
                                event_dict = convert_sets(event_dict)
                                message_history.append(event_dict)

                            if (
                                event.content
                                and event.content.parts
                                and event.content.parts[0].text
                            ):
                                current_text = event.content.parts[0].text
                                last_response = current_text
                                all_responses.append(current_text)

                            if event.actions and event.actions.escalate:
                                escalate_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                                await response_queue.put(escalate_text)
                                execution_completed.set()
                                return

                        if last_response:
                            await response_queue.put(last_response)
                        else:
                            await response_queue.put(
                                "Finished without specific response"
                            )

                        execution_completed.set()
                    except Exception as e:
                        logger.error(f"Error in process_events: {str(e)}")
                        await response_queue.put(f"Error: {str(e)}")
                        execution_completed.set()

                task = asyncio.create_task(process_events())

                try:
                    wait_task = asyncio.create_task(execution_completed.wait())
                    done, pending = await asyncio.wait({wait_task}, timeout=timeout)

                    for p in pending:
                        p.cancel()

                    if not execution_completed.is_set():
                        logger.warning(
                            f"Agent execution timed out after {timeout} seconds"
                        )
                        await response_queue.put(
                            "The response took too long and was interrupted."
                        )

                    final_response_text = await response_queue.get()

                except Exception as e:
                    logger.error(f"Error waiting for response: {str(e)}")
                    final_response_text = f"Error processing response: {str(e)}"

                # Add the session to memory after completion
                completed_session = session_service.get_session(
                    app_name=agent_id,
                    user_id=external_id,
                    session_id=adk_session_id,
                )

                memory_service.add_session_to_memory(completed_session)

                # Cancel the processing task if it is still running
                if not task.done():
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        logger.info("Task cancelled successfully")
                    except Exception as e:
                        logger.error(f"Error cancelling task: {str(e)}")

            except Exception as e:
                logger.error(f"Error processing request: {str(e)}")
                raise InternalServerError(str(e)) from e

            logger.info("Agent execution completed successfully")
            return {
                "final_response": final_response_text,
                "message_history": message_history,
            }
        except AgentNotFoundError as e:
            logger.error(f"Error processing request: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Internal error processing request: {str(e)}", exc_info=True)
            raise InternalServerError(str(e))
        finally:
            # Clean up MCP connection - MUST be executed in the same task
            if exit_stack:
                logger.info("Closing MCP server connection...")
                try:
                    await exit_stack.aclose()
                except Exception as e:
                    logger.error(f"Error closing MCP connection: {e}")
                    # Do not raise the exception to not obscure the original error


def convert_sets(obj):
    if isinstance(obj, set):
        return list(obj)
    elif isinstance(obj, dict):
        return {k: convert_sets(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_sets(i) for i in obj]
    else:
        return obj


class EventAggregator:
    """
    Aggregates streaming events to prevent token-by-token flooding.
    Uses time-based debouncing AND enforces stable message IDs for consecutive updates.
    """
    def __init__(self, buffer_time_ms: float = 200):
        self.buffer_time = buffer_time_ms / 1000  # Convert to seconds
        self.last_yield_time = 0
        self.events_buffer = []
        
        # Stable ID tracking
        self.current_message_id = None
        self.last_author = None
        self.last_role = None
        
    def add_event(self, event_dict: dict):
        """Add event to buffer, ensuring stable ID for continuous streams"""
        import uuid
        
        # Extract metadata to determine continuity
        author = event_dict.get("author")
        content = event_dict.get("content", {})
        role = content.get("role") if isinstance(content, dict) else None
        
        # Check if this is a continuation of the previous message stream
        # A2A agents often stream "Thinking..." then "Thinking... X" then "Tool Call"
        # We want to keep the same ID for the same "Logical Step".
        # If author and role match, it's likely the same stream.
        is_continuation = (
            self.current_message_id is not None and
            author == self.last_author and
            role == self.last_role
        )
        
        if is_continuation:
            # Reuse the existing stable ID
            event_dict["id"] = self.current_message_id
        else:
            # Start a new message stream
            # Force a NEW stable ID for this new logical step
            # This ensures the frontend sees it as a new message (if ID changes)
            # OR as an update to the current message (if we kept ID).
            # But here we WANT to update the current message IF it's a continuation.
            # If it's NOT a continuation, we generate a new ID.
            
            # If the original event had no ID (common in some streams), we generate one.
            # If it HAD an ID, we override it to our stable ID to ensure continuity.
            
            if "id" not in event_dict or True: # Force stable ID generation
                event_dict["id"] = str(uuid.uuid4())
                
            self.current_message_id = event_dict["id"]
            self.last_author = author
            self.last_role = role
            
        self.events_buffer.append(event_dict)
    
    def should_yield(self) -> bool:
        """Determine if enough time has passed to yield"""
        import time
        
        if not self.events_buffer:
            return False
            
        current_time = time.time()
        time_since_last = current_time - self.last_yield_time
        
        # Yield if buffer time has passed
        return time_since_last >= self.buffer_time
    
    def get_latest_event(self) -> dict:
        """Get the most recent event from buffer and clear it"""
        import time
        
        if not self.events_buffer:
            return None
            
        # Return the last (most complete) event
        latest = self.events_buffer[-1]
        self.events_buffer = []
        self.last_yield_time = time.time()
        return latest


async def run_agent_stream(
    agent_id: str,
    external_id: str,
    message: str,
    session_service: DatabaseSessionService,
    artifacts_service: InMemoryArtifactService,
    memory_service: InMemoryMemoryService,
    db: Session,
    session_id: Optional[str] = None,
    files: Optional[list] = None,
) -> AsyncGenerator[str, None]:
    tracer = get_tracer()
    span = tracer.start_span(
        "run_agent_stream",
        attributes={
            "agent_id": agent_id,
            "external_id": external_id,
            "session_id": session_id or f"{external_id}_{agent_id}",
            "message": message,
            "has_files": files is not None and len(files) > 0,
        },
    )
    try:
        with trace.use_span(span, end_on_exit=True):
            try:
                logger.info(
                    f"Starting streaming execution of agent {agent_id} for external_id {external_id}"
                )
                logger.debug(f"Received message: {message}")

                if files and len(files) > 0:
                    logger.debug(f"Received {len(files)} files with message")

                get_root_agent = get_agent(db, agent_id)
                logger.debug(
                    f"Root agent found: {get_root_agent.name} (type: {get_root_agent.type})"
                )

                if get_root_agent is None:
                    raise AgentNotFoundError(f"Agent with ID {agent_id} not found")

                # Using the AgentBuilder to create the agent
                agent_builder = AgentBuilder(db)
                root_agent, exit_stack = await agent_builder.build_agent(get_root_agent)

                logger.debug("Configuring Runner")
                agent_runner = Runner(
                    agent=root_agent,
                    app_name=agent_id,
                    session_service=session_service,
                    artifact_service=artifacts_service,
                    memory_service=memory_service,
                )
                adk_session_id = f"{external_id}_{agent_id}"
                if session_id is None:
                    session_id = adk_session_id

                logger.debug(f"Searching session for external_id {external_id}")
                session = session_service.get_session(
                    app_name=agent_id,
                    user_id=external_id,
                    session_id=adk_session_id,
                )

                if session is None:
                    logger.debug(f"Creating new session for external_id {external_id}")
                    session = session_service.create_session(
                        app_name=agent_id,
                        user_id=external_id,
                        session_id=adk_session_id,
                    )

                # Process the received files
                file_parts = []
                if files and len(files) > 0:
                    for file_data in files:
                        try:
                            # Decode the base64 file
                            file_bytes = base64.b64decode(file_data.data)

                            # Detailed debug
                            # Detailed debug
                            logger.debug(
                                f"Processing file: {file_data.filename}"
                            )
                            logger.debug(f"File size: {len(file_bytes)} bytes")
                            logger.debug(
                                f"MIME type: '{file_data.content_type}'"
                            )
                            logger.debug(f"First 20 bytes: {file_bytes[:20]}")

                            # Create a Part for the file using the default constructor
                            try:
                                file_part = Part(
                                    inline_data=Blob(
                                        mime_type=file_data.content_type,
                                        data=file_bytes,
                                    )
                                )
                                logger.debug(f"Part created successfully")
                            except Exception as part_error:
                                logger.error(
                                    f"DEBUG - Error creating Part: {str(part_error)}"
                                )
                                logger.error(
                                    f"DEBUG - Error type: {type(part_error).__name__}"
                                )
                                import traceback

                                logger.error(
                                    f"DEBUG - Stack trace: {traceback.format_exc()}"
                                )
                                raise

                            # Save the file in the ArtifactService
                            version = artifacts_service.save_artifact(
                                app_name=agent_id,
                                user_id=external_id,
                                session_id=adk_session_id,
                                filename=file_data.filename,
                                artifact=file_part,
                            )
                            logger.info(
                                f"Saved file {file_data.filename} as version {version}"
                            )

                            # Add the Part to the list of parts for the message content
                            file_parts.append(file_part)
                        except Exception as e:
                            logger.error(
                                f"Error processing file {file_data.filename}: {str(e)}"
                            )

                # Create the content with the text message and the files
                parts = [Part(text=message)]
                if file_parts:
                    parts.extend(file_parts)

                content = Content(role="user", parts=parts)
                logger.info("Starting agent streaming execution")

                try:
                    events_async = agent_runner.run_async(
                        user_id=external_id,
                        session_id=adk_session_id,
                        new_message=content,
                    )

                    # Initialize the event aggregator with 200ms debounce
                    aggregator = EventAggregator(buffer_time_ms=200)
                    import asyncio

                    async for event in events_async:
                        try:
                            event_dict = event.model_dump()
                            event_dict = convert_sets(event_dict)

                            if "content" in event_dict and event_dict["content"]:
                                content = event_dict["content"]

                                if "role" not in content or content["role"] not in [
                                    "user",
                                    "agent",
                                ]:
                                    content["role"] = "agent"

                                if "parts" in content and content["parts"]:
                                    valid_parts = []
                                    for part in content["parts"]:
                                        if isinstance(part, dict):
                                            if "type" not in part and "text" in part:
                                                part["type"] = "text"
                                                valid_parts.append(part)
                                            elif "type" in part:
                                                valid_parts.append(part)

                                    if valid_parts:
                                        content["parts"] = valid_parts
                                    else:
                                        content["parts"] = [
                                            {
                                                "type": "text",
                                                "text": "Content without valid format",
                                            }
                                        ]
                                else:
                                    content["parts"] = [
                                        {
                                            "type": "text",
                                            "text": "Content without parts",
                                        }
                                    ]

                            # Add event to buffer
                            aggregator.add_event(event_dict)
                            
                            # Check if we should yield buffered events
                            if aggregator.should_yield():
                                latest_event = aggregator.get_latest_event()
                                if latest_event:
                                    yield json.dumps(latest_event)
                                    
                        except Exception as e:
                            logger.error(f"Error processing event: {e}")
                            continue
                    
                    # Flush any remaining events in the aggregator
                    final_event = aggregator.get_latest_event()
                    if final_event:
                        yield json.dumps(final_event)

                    completed_session = session_service.get_session(
                        app_name=agent_id,
                        user_id=external_id,
                        session_id=adk_session_id,
                    )

                    memory_service.add_session_to_memory(completed_session)
                except Exception as e:
                    import traceback
                    logger.error(f"Error during agent execution: {e}\n{traceback.format_exc()}")
                    error_event = {
                        "role": "agent",
                        "content": {
                            "role": "agent", 
                            "parts": [{"type": "text", "text": f"\n\nError executing agent: {str(e)}"}],
                        },
                    }
                    yield json.dumps(error_event)
                finally:
                    # Clean up MCP connection
                    if exit_stack:
                        logger.info("Closing MCP server connection...")
                        try:
                            await exit_stack.aclose()
                        except Exception as e:
                            logger.error(f"Error closing MCP connection: {e}")

                logger.info("Agent streaming execution completed successfully")
            except GeneratorExit:
                # Client disconnected - log and re-raise
                logger.debug("Client disconnected during streaming (GeneratorExit)")
                raise
            except AgentNotFoundError as e:
                logger.error(f"Error processing request: {str(e)}")
                raise InternalServerError(str(e)) from e
            except Exception as e:
                logger.error(
                    f"Internal error processing request: {str(e)}", exc_info=True
                )
                raise InternalServerError(str(e))
    except (ValueError, RuntimeError) as ctx_error:
        # Suppress benign context errors during cleanup
        error_msg = str(ctx_error)
        if "Context" in error_msg or "detach" in error_msg or "Token" in error_msg:
            logger.debug(f"Suppressed context cleanup error: {ctx_error}")
        else:
            raise
    finally:
        try:
            span.end()
        except Exception as final_error:
            # Suppress any errors during final span cleanup
            logger.debug(f"Suppressed final span cleanup error: {final_error}")
