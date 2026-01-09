"""
Dependency injection configuration for FastAPI.
"""

from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from src.config.database import SessionLocal
from src.repositories.agent_repository import AgentRepository
from src.repositories.user_repository import UserRepository
from src.repositories.session_repository import SessionRepository


def get_db() -> Generator[Session, None, None]:
    """
    Dependency para obter sessão do banco de dados.

    Yields:
        Session do SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_agent_repository(db: Session = Depends(get_db)) -> AgentRepository:
    """
    Dependency para AgentRepository.

    Args:
        db: Sessão do banco de dados

    Returns:
        Instância de AgentRepository
    """
    return AgentRepository(db)


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    """
    Dependency para UserRepository.

    Args:
        db: Sessão do banco de dados

    Returns:
        Instância de UserRepository
    """
    return UserRepository(db)


def get_session_repository(db: Session = Depends(get_db)) -> SessionRepository:
    """
    Dependency para SessionRepository.

    Args:
        db: Sessão do banco de dados

    Returns:
        Instância de SessionRepository
    """
    return SessionRepository(db)
