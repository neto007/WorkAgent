import json
import logging
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.config.settings import settings
from src.core.exceptions import AgentNotFoundError
from src.core.jwt_middleware import (
    get_jwt_token,
    get_jwt_token_ws,
    verify_user_client,
)
from src.schemas.chat import ChatRequest, ChatResponse, ErrorResponse, FileData
from src.services import (
    agent_service,
)
from src.services.adk.agent_runner import run_agent as run_agent_adk
from src.services.adk.agent_runner import run_agent_stream
from src.services.crewai.agent_runner import run_agent as run_agent_crewai
from src.services.service_providers import (
    artifacts_service,
    memory_service,
    session_service,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)


async def get_agent_by_api_key(
    agent_id: str,
    api_key: str | None = Header(None, alias="x-api-key"),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    """Flexible authentication for chat routes, allowing JWT or API key"""
    if authorization:
        # Try to authenticate with JWT token first
        try:
            # Extract token from Authorization header if needed
            token = (
                authorization.replace("Bearer ", "")
                if authorization.startswith("Bearer ")
                else authorization
            )
            payload = await get_jwt_token(token)
            agent = agent_service.get_agent(db, agent_id)
            if not agent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Agent not found",
                )

            # Verify if the user has access to the agent's client
            await verify_user_client(payload, db, agent.client_id)
            return agent
        except Exception as e:
            logger.warning(f"JWT authentication failed: {str(e)}")
            # If JWT fails, continue to try with API key

    # Try to authenticate with API key
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required (JWT or API key)",
        )

    agent = agent_service.get_agent(db, agent_id)
    if not agent or not agent.config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    # Verify if the API key matches
    if not agent.config.get("api_key") or agent.config.get("api_key") != api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")

    return agent


@router.websocket("/ws/{agent_id}/{external_id}")
async def websocket_chat(
    websocket: WebSocket,
    agent_id: str,
    external_id: str,
    db: Session = Depends(get_db),
):
    try:
        await websocket.accept()
        logger.info("WebSocket connection accepted, checking for authentication")

        is_authenticated = False
        first_message_data = None

        # 1. Try Cookie Authentication
        cookie_token = websocket.cookies.get("access_token")
        if cookie_token:
            try:
                payload = await get_jwt_token_ws(cookie_token)
                agent = agent_service.get_agent(db, agent_id)
                if agent and payload:
                    await verify_user_client(payload, db, agent.client_id)
                    is_authenticated = True
                    logger.info(f"Authenticated via Cookie for agent {agent_id}")
            except Exception as e:
                logger.warning(f"Cookie authentication failed: {str(e)}")

        # 2. Handle First Message (Auth or Chat)
        try:
            data = await websocket.receive_json()

            # Check if it is an explicit auth message
            if data.get("type") == "authorization":
                logger.info(f"Authentication data received: {data}")

                # Logic for explicit auth (override cookie auth or first attempt)
                auth_success_local = False
                agent = agent_service.get_agent(db, agent_id)

                if not agent:
                    logger.warning(f"Agent {agent_id} not found")
                    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return

                if data.get("token"):
                    try:
                        payload = await get_jwt_token_ws(data["token"])
                        if payload:
                            await verify_user_client(payload, db, agent.client_id)
                            auth_success_local = True
                    except Exception as e:
                        logger.warning(f"JWT handshake authentication failed: {str(e)}")

                if not auth_success_local and data.get("api_key"):
                    if agent.config and agent.config.get("api_key") == data.get("api_key"):
                        auth_success_local = True
                    else:
                        logger.warning("Invalid API key")

                if auth_success_local:
                    is_authenticated = True
                elif not is_authenticated:  # Failed local auth and no cookie auth
                    logger.warning("Invalid authentication message")
                    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return

            else:
                # It is NOT an auth message. It is likely a chat message.
                if is_authenticated:
                    # Treat as first chat message
                    first_message_data = data
                else:
                    # Not authenticated and not an auth message -> Fail
                    logger.warning("Unauthenticated connection attempting to send data")
                    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return

        except WebSocketDisconnect:
            logger.info("Client disconnected during handshake")
            return

        if not is_authenticated:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        logger.info(
            f"WebSocket connection established for agent {agent_id} and external_id {external_id}"
        )

        # 3. Message Processing Loop
        while True:
            try:
                if first_message_data:
                    data = first_message_data
                    first_message_data = None
                    logger.info(f"Processing first message: {data}")
                else:
                    data = await websocket.receive_json()
                    logger.info(f"Received message: {data}")

                message = data.get("message")

                if not message:
                    continue

                files = None
                if data.get("files") and isinstance(data.get("files"), list):
                    try:
                        files = []
                        for file_data in data.get("files"):
                            if (
                                isinstance(file_data, dict)
                                and file_data.get("filename")
                                and file_data.get("content_type")
                                and file_data.get("data")
                            ):
                                files.append(
                                    FileData(
                                        filename=file_data.get("filename"),
                                        content_type=file_data.get("content_type"),
                                        data=file_data.get("data"),
                                    )
                                )
                        logger.info(f"Processed {len(files)} files via WebSocket")
                    except Exception as e:
                        logger.error(f"Error processing files: {str(e)}")
                        files = None

                async for chunk in run_agent_stream(
                    agent_id=agent_id,
                    external_id=external_id,
                    message=message,
                    session_service=session_service,
                    artifacts_service=artifacts_service,
                    memory_service=memory_service,
                    db=db,
                    files=files,
                ):
                    await websocket.send_json(
                        {"message": json.loads(chunk), "turn_complete": False}
                    )

                # Send signal of complete turn
                await websocket.send_json({"message": "", "turn_complete": True})

            except WebSocketDisconnect:
                logger.info("Client disconnected")
                break
            except json.JSONDecodeError:
                logger.warning("Invalid JSON message received")
                continue
            except Exception as e:
                logger.error(f"Error in WebSocket message handling: {str(e)}")
                await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
                break

    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)


@router.post(
    "/{agent_id}/{external_id}",
    response_model=ChatResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def chat(
    request: ChatRequest,
    agent_id: str,
    external_id: str,
    _=Depends(get_agent_by_api_key),
    db: Session = Depends(get_db),
):
    try:
        if settings.AI_ENGINE == "adk":
            final_response = await run_agent_adk(
                agent_id,
                external_id,
                request.message,
                session_service,
                artifacts_service,
                memory_service,
                db,
                files=request.files,
            )
        elif settings.AI_ENGINE == "crewai":
            final_response = await run_agent_crewai(
                agent_id,
                external_id,
                request.message,
                session_service,
                db,
                files=request.files,
            )

        return {
            "response": final_response["final_response"],
            "message_history": final_response["message_history"],
            "status": "success",
            "timestamp": datetime.now().isoformat(),
        }

    except AgentNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e
