import os
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
from google.adk.sessions import DatabaseSessionService
from google.adk.memory import InMemoryMemoryService
from dotenv import load_dotenv

load_dotenv()

from src.services.crewai.session_service import CrewSessionService

if os.getenv("AI_ENGINE") == "crewai":
    session_service = CrewSessionService(db_url=os.getenv("POSTGRES_CONNECTION_STRING"))
else:
    session_service = DatabaseSessionService(
        db_url=os.getenv("POSTGRES_CONNECTION_STRING")
    )

artifacts_service = InMemoryArtifactService()
memory_service = InMemoryMemoryService()
