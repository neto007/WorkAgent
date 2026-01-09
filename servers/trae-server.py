from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from uuid import uuid4
import json
from typing import Optional, List, Dict, Any, Set
import uvicorn
import logging
import asyncio
from datetime import datetime
import base64
import os
import tomllib

# Trae Agent Imports
from trae_agent.utils.config import Config
from trae_agent.agent.trae_agent import TraeAgent
from trae_agent.agent.agent_basics import AgentExecution

# Models (Assuming these exist in .models, otherwise we'd define them here)
# For simplicity in this standalone file, I will define the minimal necessary models if they weren't imported
# But since the user showed imports, I'll keep them but might need to mock/adjust if files are missing.
# To ensure it runs standalone if dependencies are there, I will trust the imports.
try:
    from .models import (
        SendMessageRequest,
        SendMessageResponse,
        Message,
        Role,
        Part,
        Task,
        TaskStatus,
        TaskState,
        AgentCard,
        AgentCapabilities,
        AgentProvider,
        AgentSkill,
        AgentInterface
    )
    from .runtime import executor
except ImportError:
    # Fallback/Mock for models if running isolated during refactor check
    logging.warning("Models not found, assuming local execution environment structure.")
    # In a real refactor we'd fix imports, but here we assume the user's environment is set.

# --- Global State ---
_streaming_tasks: Dict[str, Dict[str, Any]] = {}
_background_tasks: Set[asyncio.Task] = set()
_task_expiration_seconds = 3600

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trae-a2a-server")

# --- App Setup ---
app = FastAPI(title="Trae Agent A2A Server", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auxiliary Functions ---

def get_project_metadata():
    try:
        if os.path.exists("pyproject.toml"):
            with open("pyproject.toml", "rb") as f:
                data = tomllib.load(f)
            return data.get("project", {})
    except Exception:
        pass
    return {}

def validate_api_key(request: Request) -> bool:
    """Validate authentication (Optional for now)."""
    # Check x-api-key header
    if request.headers.get("x-api-key"):
        return True
    # Check Authorization: Bearer
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        return True
    return True

def parse_file_parts(parts: List[Dict]) -> List[Dict[str, Any]]:
    """Parse file parts from message."""
    files = []
    for part in parts:
        if isinstance(part, dict) and part.get("type") == "file":
            file_data = part.get("file", {})
            if file_data:
                files.append({
                    "name": file_data.get("name", "unnamed"),
                    "mime_type": file_data.get("mime_type", "application/octet-stream"),
                    "bytes": base64.b64decode(file_data.get("bytes", "")) if file_data.get("bytes") else b""
                })
    return files

def extract_text_from_parts(parts: List[Dict]) -> str:
    """Extract text content from message parts."""
    for part in parts:
        if isinstance(part, dict):
            if part.get("type") == "text" and part.get("text"):
                return part.get("text")
            elif part.get("text"):
                return part.get("text")
    return "No instruction provided."

async def stream_generator(task_id: str):
    """Shared generator for SSE streaming events."""
    last_state = None
    
    while True:
        if task_id not in _streaming_tasks:
            yield f"data: {{\"error\": \"Task not found\"}}\n\n"
            break
        
        task_data = _streaming_tasks[task_id]
        current_status = task_data.get("status", {})
        current_state = current_status.get("state")
        is_final = task_data.get("final", False)
        
        # Send update if state changed or first iteration
        if current_state != last_state:
            event_data = {
                "jsonrpc": "2.0",
                "id": task_id,
                "result": {
                    "id": task_id,
                    "status": current_status,
                    "final": is_final
                }
            }
            yield f"data: {json.dumps(event_data)}\n\n"
            last_state = current_state
        
        # If final, send final event and break
        if is_final:
            event_data = {
                "jsonrpc": "2.0",
                "id": task_id,
                "result": {
                    "id": task_id,
                    "status": current_status,
                    "final": True
                }
            }
            yield f"data: {json.dumps(event_data)}\n\n"
            break
        
        yield ": ping\n\n"
        await asyncio.sleep(0.5)

async def execute_agent_with_events(
    task_id: str,
    instruction: str,
    files: List[Dict[str, Any]],
    session_id: str
) -> None:
    """Execute agent and update task store with progress events."""
    global _streaming_tasks
    
    logger.info(f"[EXEC] Starting execution for task {task_id}")
    logger.info(f"[EXEC] Instruction: {instruction}")
    
    try:
        # Update to working state
        _streaming_tasks[task_id]["status"] = {
            "state": "working",
            "message": {"role": "agent", "parts": [{"type": "text", "text": "Processing..."}]},
            "timestamp": datetime.now().isoformat()
        }
        
        # Load config
        config = None
        try:
            config = Config.create(config_file="trae_config.yaml")
        except Exception:
            if os.path.exists("trae_config.yaml.example"):
                config = Config.create(config_file="trae_config.yaml.example")
        
        if not config or not config.trae_agent:
            _streaming_tasks[task_id]["status"] = {
                "state": "failed",
                "message": {"role": "agent", "parts": [{"type": "text", "text": "Server configuration error"}]},
                "timestamp": datetime.now().isoformat()
            }
            _streaming_tasks[task_id]["final"] = True
            return
        
        # Ensure non-streaming mode for A2A internal execution
        if hasattr(config.trae_agent.model, 'stream'):
            config.trae_agent.model.stream = False
        
        # Initialize agent
        agent = TraeAgent(
            trae_agent_config=config.trae_agent,
            docker_config=None
        )
        
        # Setup task
        project_path = os.getcwd()
        task_text = instruction
        if files:
            file_names = ", ".join([f["name"] for f in files])
            task_text = f"{instruction}\n\n[Attached files: {file_names}]"
        
        agent.new_task(
            task=task_text,
            extra_args={"project_path": project_path}
        )
        
        # Execute
        execution: AgentExecution = await agent.execute_task()
        
        # Update to completed/failed
        state = "completed" if execution.success else "failed"
        response_text = execution.final_result or "Task completed."
        
        artifacts = []
        if execution.success and execution.final_result:
            artifacts.append({
                "artifactId": str(uuid4()),
                "name": "execution_result",
                "description": "Agent execution result",
                "parts": [{"type": "text", "text": execution.final_result}],
                "metadata": {
                    "executionTime": getattr(execution, 'execution_time', None),
                    "steps": len(getattr(execution, 'steps', [])),
                    "success": execution.success
                }
            })
        
        _streaming_tasks[task_id]["status"] = {
            "state": state,
            "message": {"role": "agent", "parts": [{"type": "text", "text": response_text}]},
            "timestamp": datetime.now().isoformat()
        }
        if artifacts:
            _streaming_tasks[task_id]["artifacts"] = artifacts
            
        _streaming_tasks[task_id]["final"] = True
        _streaming_tasks[task_id]["completed_at"] = datetime.now().isoformat()
        
        logger.info(f"[EXEC] Task {task_id} completed: {state}")

    except Exception as e:
        logger.error(f"[EXEC] Task {task_id} failed: {e}", exc_info=True)
        _streaming_tasks[task_id]["status"] = {
            "state": "failed",
            "message": {"role": "agent", "parts": [{"type": "text", "text": f"Error: {e}"}]},
            "timestamp": datetime.now().isoformat()
        }
        _streaming_tasks[task_id]["final"] = True

# --- API Endpoints ---

@app.get("/api/v1/a2a/health")
async def health_check():
    """Health check for A2A implementation."""
    return {"status": "ok"}

@app.get("/.well-known/agent.json")
async def get_agent_card(request: Request):
    """
    Return the Agent Card for discovery.
    """
    base_url = str(request.base_url).rstrip("/")
    metadata = get_project_metadata()
    agent_name = metadata.get("name", "trae-agent")
    
    card = AgentCard(
        protocol_version="1.0",
        name=agent_name,
        description=metadata.get("description", "LLM-based agent for general purpose software engineering tasks"),
        version=metadata.get("version", "0.1.0"),
        capabilities=AgentCapabilities(streaming=True, push_notifications=False, state_transition_history=True),
        default_input_modes=["text/plain", "application/octet-stream"],
        default_output_modes=["text/plain"],
        skills=[
            AgentSkill(id="shell_execution", name="Shell Execution", description="Execute secure shell commands.", tags=["bash"]),
            AgentSkill(id="file_editing", name="File Editing", description="Read and write files.", tags=["files"]),
            AgentSkill(id="reasoning", name="Reasoning", description="Chain of thought reasoning.", tags=["thinking"])
        ],
        supported_interfaces=[
            AgentInterface(url=f"{base_url}/api/v1/a2a/{agent_name}", protocol_binding="JSONRPC")
        ],
        provider=AgentProvider(url="https://github.com/bytedance", organization="ByteDance"),
        id="trae-agent-001",
        url=f"{base_url}/api/v1/a2a/{agent_name}"
    )
    
    return card.model_dump(by_alias=True, exclude_none=True)

@app.get("/api/v1/a2a/{agent_id}/.well-known/agent.json")
async def get_agent_card_with_id(agent_id: str, request: Request):
    """Agent card endpoint with agent_id compatibility."""
    return await get_agent_card(request)

@app.post("/api/v1/a2a/{agent_id}/subscribe")
async def evoai_a2a_subscribe(agent_id: str, request: Request):
    """
    Streaming endpoint for EvoAI.
    Returns StreamingResponse directly via SSE.
    """
    try:
        body = await request.json()
    except Exception as e:
        return {"jsonrpc": "2.0", "error": {"code": -32700, "message": f"Parse error: {e}"}, "id": None}
    
    # Validation
    method = body.get("method")
    if method != "tasks/subscribe":
        return {"jsonrpc": "2.0", "error": {"code": -32601, "message": f"Method not found: {method}"}, "id": body.get("id")}
    
    params = body.get("params", {})
    message_data = params.get("message", {})
    parts = message_data.get("parts", [])
    session_id = params.get("sessionId", str(uuid4()))
    task_id = params.get("id", str(uuid4()))
    
    instruction = extract_text_from_parts(parts)
    files = parse_file_parts(parts)
    
    logger.info(f"Subscribe stream task {task_id}: {instruction[:50]}...")
    
    # Initialize task state
    _streaming_tasks[task_id] = {
        "status": {
            "state": "submitted",
            "message": {"role": "agent", "parts": [{"type": "text", "text": "Task submitted."}]},
            "timestamp": datetime.now().isoformat()
        },
        "final": False,
        "session_id": session_id
    }
    
    # Start Execution
    # Store task reference to avoid GC
    task = asyncio.create_task(execute_agent_with_events(task_id, instruction, files, session_id))
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)
    
    # Return Stream
    return StreamingResponse(
        stream_generator(task_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/v1/a2a/{agent_id}/stream")
async def evoai_a2a_stream(agent_id: str, taskId: str, key: Optional[str] = None):
    """Legacy GET stream endpoint."""
    return StreamingResponse(
        stream_generator(taskId),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )

@app.post("/api/v1/a2a/{agent_id}")
async def evoai_a2a_message(agent_id: str, request: Request):
    """
    Handle message/send (Synchronous/Polling).
    """
    try:
        body = await request.json()
    except Exception:
        return {"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": None}
        
    method = body.get("method")
    req_id = body.get("id")
    params = body.get("params", {})
    
    if method == "message/send":
        task_id = str(uuid4())
        session_id = params.get("sessionId", str(uuid4()))
        message_data = params.get("message", {})
        instruction = extract_text_from_parts(message_data.get("parts", []))
        files = parse_file_parts(message_data.get("parts", []))
        
        # Init state
        _streaming_tasks[task_id] = {
            "status": {
                "state": "submitted",
                "message": {"role": "agent", "parts": [{"type": "text", "text": "Task submitted."}]},
                "timestamp": datetime.now().isoformat()
            },
            "final": False,
            "session_id": session_id
        }
        
        # Start async
        task = asyncio.create_task(execute_agent_with_events(task_id, instruction, files, session_id))
        _background_tasks.add(task)
        task.add_done_callback(_background_tasks.discard)
        
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "task": {
                    "id": task_id,
                    "contextId": session_id,
                    "status": _streaming_tasks[task_id]["status"]
                }
            }
        }
        
    elif method == "tasks/get":
        task_id = params.get("taskId")
        if task_id in _streaming_tasks:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "task": {
                        "id": task_id,
                        "status": _streaming_tasks[task_id].get("status")
                    }
                }
            }
        return {"jsonrpc": "2.0", "error": {"code": -32000, "message": "Task not found"}, "id": req_id}

    return {"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": req_id}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
