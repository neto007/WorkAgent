import os
import sys
import warnings
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from src.config.database import Base, engine
from src.config.settings import settings
from src.utils.logger import setup_logger
from src.utils.otel import init_otel

# Suppress WebSocket deprecation warning
warnings.filterwarnings(
    "ignore", message="remove second argument of ws_handler", category=DeprecationWarning
)

# Necessary for other modules
import src.api.a2a_routes
import src.api.admin_routes
import src.api.agent_routes
import src.api.auth_routes
import src.api.chat_routes
import src.api.client_routes
import src.api.client_users_routes
import src.api.mcp_server_routes
import src.api.session_routes
import src.api.tool_routes
import src.api.upload_routes
from src.services.service_providers import (
    artifacts_service,  # noqa: F401
    memory_service,  # noqa: F401
    session_service,  # noqa: F401
)

# Add the root directory to PYTHONPATH
root_dir = Path(__file__).parent.parent
sys.path.append(str(root_dir))

# Configure logger
logger = setup_logger(__name__)

# FastAPI initialization
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    redirect_slashes=False,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files configuration
static_dir = Path("static")
if not static_dir.exists():
    static_dir.mkdir(parents=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# PostgreSQL configuration
POSTGRES_CONNECTION_STRING = os.getenv(
    "POSTGRES_CONNECTION_STRING", "postgresql://postgres:root@localhost:5433/evo_ai"
)

# Create database tables
Base.metadata.create_all(bind=engine)

API_PREFIX = "/api/v1"

# Define router references
auth_router = src.api.auth_routes.router
admin_router = src.api.admin_routes.router
chat_router = src.api.chat_routes.router
session_router = src.api.session_routes.router
agent_router = src.api.agent_routes.router
mcp_server_router = src.api.mcp_server_routes.router
tool_router = src.api.tool_routes.router
client_router = src.api.client_routes.router
a2a_router = src.api.a2a_routes.router
upload_router = src.api.upload_routes.router
client_users_router = src.api.client_users_routes.router

# Include routes
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
app.include_router(mcp_server_router, prefix=API_PREFIX)
app.include_router(tool_router, prefix=API_PREFIX)
app.include_router(client_router, prefix=API_PREFIX)
app.include_router(chat_router, prefix=API_PREFIX)
app.include_router(session_router, prefix=API_PREFIX)
app.include_router(agent_router, prefix=API_PREFIX)
app.include_router(a2a_router, prefix=API_PREFIX)
app.include_router(upload_router, prefix=API_PREFIX)
app.include_router(client_users_router, prefix=API_PREFIX)

# Inicializa o OpenTelemetry para Langfuse
init_otel()

# Instrumenta o FastAPI automaticamente para tracing
FastAPIInstrumentor.instrument_app(app)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Evo AI API",
        "documentation": "/docs",
        "version": settings.API_VERSION,
        "auth": "To access the API, use JWT authentication via '/api/v1/auth/login'",
    }
