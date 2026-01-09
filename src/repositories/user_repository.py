"""Repository for User operations."""

from typing import Optional
from sqlalchemy.orm import Session
from src.models.models import User
from src.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository para operações de User"""

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Busca user por email.

        Args:
            email: Email do usuário

        Returns:
            User encontrado ou None
        """
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """
        Busca user por username.

        Args:
            username: Username do usuário

        Returns:
            User encontrado ou None
        """
        return self.db.query(User).filter(User.username == username).first()

    def email_exists(self, email: str) -> bool:
        """
        Verifica se email já está em uso.

        Args:
            email: Email a verificar

        Returns:
            True se email existe, False caso contrário
        """
        return self.db.query(User).filter(User.email == email).first() is not None

    def username_exists(self, username: str) -> bool:
        """
        Verifica se username já está em uso.

        Args:
            username: Username a verificar

        Returns:
            True se username existe, False caso contrário
        """
        return self.db.query(User).filter(User.username == username).first() is not None
