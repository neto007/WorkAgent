"""
Domain model for Agent with business logic.
"""

from typing import Optional, Dict, Any
from datetime import datetime


class AgentDomain:
    """Domain model para Agent com lógica de negócio"""

    def __init__(
        self,
        id: str,
        name: str,
        type: str,
        config: Dict[str, Any],
        client_id: str,
        created_at: datetime,
        description: Optional[str] = None,
        api_key_id: Optional[str] = None,
    ):
        self.id = id
        self.name = name
        self.type = type
        self.config = config
        self.client_id = client_id
        self.created_at = created_at
        self.description = description
        self.api_key_id = api_key_id

    def validate_config(self) -> bool:
        """
        Valida configuração do agent.

        Returns:
            True se configuração é válida
        """
        if self.type == "llm":
            required_keys = ["model"]
            return all(key in self.config for key in required_keys)
        return True

    def is_active(self) -> bool:
        """
        Verifica se agent está ativo.

        Returns:
            True se agent está ativo
        """
        return self.config.get("is_active", True)

    def has_api_key(self) -> bool:
        """
        Verifica se agent tem API key configurada.

        Returns:
            True se tem API key
        """
        return self.api_key_id is not None or "api_key" in self.config

    def get_model_name(self) -> Optional[str]:
        """
        Retorna nome do modelo configurado.

        Returns:
            Nome do modelo ou None
        """
        return self.config.get("model")

    def get_temperature(self) -> float:
        """
        Retorna temperatura configurada.

        Returns:
            Temperatura (padrão: 0.7)
        """
        return self.config.get("temperature", 0.7)

    @classmethod
    def from_orm(cls, agent_model):
        """
        Cria domain model a partir de ORM model.

        Args:
            agent_model: Modelo ORM do Agent

        Returns:
            Instância de AgentDomain
        """
        return cls(
            id=agent_model.id,
            name=agent_model.name,
            type=agent_model.type,
            config=agent_model.config or {},
            client_id=agent_model.client_id,
            created_at=agent_model.created_at,
            description=agent_model.description,
            api_key_id=agent_model.api_key_id,
        )

    def to_dict(self) -> Dict[str, Any]:
        """
        Converte para dicionário.

        Returns:
            Representação em dicionário
        """
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "config": self.config,
            "client_id": self.client_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "description": self.description,
            "api_key_id": self.api_key_id,
        }
