"""
Domain model for Session with business logic.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta


class SessionDomain:
    """Domain model para Session com lógica de negócio"""

    def __init__(
        self,
        id: str,
        user_id: str,
        agent_id: str,
        created_at: datetime,
        updated_at: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.id = id
        self.user_id = user_id
        self.agent_id = agent_id
        self.created_at = created_at
        self.updated_at = updated_at or created_at
        self.metadata = metadata or {}

    def is_recent(self, days: int = 7) -> bool:
        """
        Verifica se session é recente.

        Args:
            days: Número de dias para considerar como recente

        Returns:
            True se é recente
        """
        cutoff = datetime.utcnow() - timedelta(days=days)
        return self.created_at >= cutoff

    def get_duration(self) -> timedelta:
        """
        Calcula duração da session.

        Returns:
            Duração entre created_at e updated_at
        """
        return self.updated_at - self.created_at

    def get_message_count(self) -> int:
        """
        Retorna número de mensagens na session.

        Returns:
            Contagem de mensagens do metadata
        """
        return self.metadata.get("message_count", 0)

    def increment_message_count(self) -> None:
        """Incrementa contador de mensagens."""
        current = self.metadata.get("message_count", 0)
        self.metadata["message_count"] = current + 1

    @classmethod
    def from_orm(cls, session_model):
        """
        Cria domain model a partir de ORM model.

        Args:
            session_model: Modelo ORM do Session

        Returns:
            Instância de SessionDomain
        """
        return cls(
            id=session_model.id,
            user_id=session_model.user_id,
            agent_id=session_model.agent_id,
            created_at=session_model.created_at,
            updated_at=getattr(session_model, "updated_at", session_model.created_at),
            metadata=getattr(session_model, "metadata", {}),
        )

    def to_dict(self) -> Dict[str, Any]:
        """
        Converte para dicionário.

        Returns:
            Representação em dicionário
        """
        return {
            "id": self.id,
            "user_id": self.user_id,
            "agent_id": self.agent_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "metadata": self.metadata,
        }
