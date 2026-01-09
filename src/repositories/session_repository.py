"""Repository for Session operations."""

from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session as DBSession
from src.models.models import Session as SessionModel
from src.repositories.base import BaseRepository


class SessionRepository(BaseRepository[SessionModel]):
    """Repository para operações de Session"""

    def __init__(self, db: DBSession):
        super().__init__(SessionModel, db)

    def get_by_user(self, user_id: str, skip: int = 0, limit: int = 100) -> List[SessionModel]:
        """
        Lista sessions de um usuário.

        Args:
            user_id: ID do usuário
            skip: Número de registros para pular
            limit: Número máximo de registros

        Returns:
            Lista de sessions do usuário
        """
        return (
            self.db.query(SessionModel)
            .filter(SessionModel.user_id == user_id)
            .order_by(SessionModel.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_agent(self, agent_id: str, skip: int = 0, limit: int = 100) -> List[SessionModel]:
        """
        Lista sessions de um agent.

        Args:
            agent_id: ID do agent
            skip: Número de registros para pular
            limit: Número máximo de registros

        Returns:
            Lista de sessions do agent
        """
        return (
            self.db.query(SessionModel)
            .filter(SessionModel.agent_id == agent_id)
            .order_by(SessionModel.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_recent(self, user_id: str, days: int = 7) -> List[SessionModel]:
        """
        Lista sessions recentes de um usuário.

        Args:
            user_id: ID do usuário
            days: Número de dias para considerar como recente

        Returns:
            Lista de sessions recentes
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        return (
            self.db.query(SessionModel)
            .filter(SessionModel.user_id == user_id, SessionModel.created_at >= cutoff_date)
            .order_by(SessionModel.created_at.desc())
            .all()
        )

    def count_by_user(self, user_id: str) -> int:
        """
        Conta sessions de um usuário.

        Args:
            user_id: ID do usuário

        Returns:
            Número de sessions do usuário
        """
        return self.db.query(SessionModel).filter(SessionModel.user_id == user_id).count()

    def count_by_agent(self, agent_id: str) -> int:
        """
        Conta sessions de um agent.

        Args:
            agent_id: ID do agent

        Returns:
            Número de sessions do agent
        """
        return self.db.query(SessionModel).filter(SessionModel.agent_id == agent_id).count()
