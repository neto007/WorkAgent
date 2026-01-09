"""
Domain model for User with business logic.
"""

from typing import Optional
from datetime import datetime


class UserDomain:
    """Domain model para User com lógica de negócio"""

    def __init__(
        self,
        id: str,
        username: str,
        email: str,
        role: str,
        created_at: datetime,
        is_active: bool = True,
        client_id: Optional[str] = None,
    ):
        self.id = id
        self.username = username
        self.email = email
        self.role = role
        self.created_at = created_at
        self.is_active = is_active
        self.client_id = client_id

    def is_admin(self) -> bool:
        """
        Verifica se usuário é admin.

        Returns:
            True se é admin
        """
        return self.role == "admin"

    def is_editor(self) -> bool:
        """
        Verifica se usuário tem permissão de edição.

        Returns:
            True se é admin ou editor
        """
        return self.role in ["admin", "editor"]

    def is_viewer(self) -> bool:
        """
        Verifica se usuário tem permissão de visualização.

        Returns:
            True se tem qualquer role válida
        """
        return self.role in ["admin", "editor", "viewer"]

    def can_edit_client(self, client_id: str) -> bool:
        """
        Verifica se usuário pode editar um cliente.

        Args:
            client_id: ID do cliente

        Returns:
            True se pode editar
        """
        if self.is_admin():
            return True
        return self.client_id == client_id and self.is_editor()

    @classmethod
    def from_orm(cls, user_model):
        """
        Cria domain model a partir de ORM model.

        Args:
            user_model: Modelo ORM do User

        Returns:
            Instância de UserDomain
        """
        return cls(
            id=user_model.id,
            username=user_model.username,
            email=user_model.email,
            role=user_model.role,
            created_at=user_model.created_at,
            is_active=getattr(user_model, "is_active", True),
            client_id=getattr(user_model, "client_id", None),
        )

    def to_dict(self) -> dict:
        """
        Converte para dicionário.

        Returns:
            Representação em dicionário
        """
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_active": self.is_active,
            "client_id": self.client_id,
        }
