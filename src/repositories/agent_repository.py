"""Repository for Agent operations."""

from typing import List, Optional
from sqlalchemy.orm import Session
from src.models.models import Agent
from src.repositories.base import BaseRepository


class AgentRepository(BaseRepository[Agent]):
    """Repository para operações de Agent"""

    def __init__(self, db: Session):
        super().__init__(Agent, db)

    def get_by_name(self, name: str) -> Optional[Agent]:
        """
        Busca agent por nome.

        Args:
            name: Nome do agent

        Returns:
            Agent encontrado ou None
        """
        return self.db.query(Agent).filter(Agent.name == name).first()

    def get_by_client(self, client_id: str, skip: int = 0, limit: int = 100) -> List[Agent]:
        """
        Lista agents de um cliente.

        Args:
            client_id: ID do cliente
            skip: Número de registros para pular
            limit: Número máximo de registros

        Returns:
            Lista de agents do cliente
        """
        return (
            self.db.query(Agent)
            .filter(Agent.client_id == client_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_type(self, agent_type: str) -> List[Agent]:
        """
        Busca agents por tipo.

        Args:
            agent_type: Tipo do agent (llm, sequential, etc.)

        Returns:
            Lista de agents do tipo especificado
        """
        return self.db.query(Agent).filter(Agent.type == agent_type).all()

    def search_by_name(self, name_pattern: str, limit: int = 10) -> List[Agent]:
        """
        Busca agents por padrão no nome.

        Args:
            name_pattern: Padrão para busca (case-insensitive)
            limit: Número máximo de resultados

        Returns:
            Lista de agents que correspondem ao padrão
        """
        return self.db.query(Agent).filter(Agent.name.ilike(f"%{name_pattern}%")).limit(limit).all()

    def count_by_client(self, client_id: str) -> int:
        """
        Conta agents de um cliente.

        Args:
            client_id: ID do cliente

        Returns:
            Número de agents do cliente
        """
        return self.db.query(Agent).filter(Agent.client_id == client_id).count()
