"""
Token Service for JWT token management with refresh tokens.
"""

import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from src.models.models import RefreshToken
from src.services.auth_service import create_access_token
import logging

logger = logging.getLogger(__name__)


class TokenService:
    """Service para gerenciamento de tokens JWT"""

    # Configurações de expiração
    ACCESS_TOKEN_EXPIRE = timedelta(minutes=15)  # Token curto
    REFRESH_TOKEN_EXPIRE = timedelta(days=30)  # Token longo

    def create_token_pair(
        self, user_id: str, db: Session, device_info: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Cria par de access + refresh token.

        Args:
            user_id: ID do usuário
            db: Sessão do banco
            device_info: Informações do dispositivo (user agent, IP)

        Returns:
            Tupla (access_token, refresh_token)
        """
        # Buscar usuário do banco
        from src.services.user_service import get_user_by_id

        user = get_user_by_id(db, user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")

        # Criar access token (curto)
        access_token = create_access_token(user)

        # Criar refresh token (longo)
        refresh_token_raw = secrets.token_urlsafe(32)
        refresh_token_hash = hashlib.sha256(refresh_token_raw.encode()).hexdigest()

        # Salvar refresh token no banco
        refresh_token_db = RefreshToken(
            user_id=user_id,
            token_hash=refresh_token_hash,
            expires_at=datetime.utcnow() + self.REFRESH_TOKEN_EXPIRE,
            device_info=device_info,
        )
        db.add(refresh_token_db)
        db.commit()

        logger.info(f"Created token pair for user {user_id}")
        return access_token, refresh_token_raw

    def refresh_access_token(self, refresh_token: str, db: Session) -> Optional[str]:
        """
        Renova access token usando refresh token.

        Args:
            refresh_token: Refresh token
            db: Sessão do banco

        Returns:
            Novo access token ou None se inválido
        """
        # Hash do token
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        # Buscar refresh token válido
        db_token = (
            db.query(RefreshToken)
            .filter(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked == False,
                RefreshToken.expires_at > datetime.utcnow(),
            )
            .first()
        )

        if not db_token:
            logger.warning(f"Invalid or expired refresh token")
            return None

        # Buscar usuário
        from src.services.user_service import get_user_by_id

        user = get_user_by_id(db, str(db_token.user_id))
        if not user:
            logger.warning(f"User not found for refresh token")
            return None

        # Criar novo access token
        access_token = create_access_token(user)

        logger.info(f"Refreshed access token for user {db_token.user_id}")
        return access_token

    def revoke_refresh_token(self, refresh_token: str, db: Session) -> bool:
        """
        Revoga refresh token.

        Args:
            refresh_token: Refresh token a revogar
            db: Sessão do banco

        Returns:
            True se revogado, False se não encontrado
        """
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        db_token = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()

        if db_token:
            db_token.revoked = True
            db.commit()
            logger.info(f"Revoked refresh token for user {db_token.user_id}")
            return True

        logger.warning(f"Refresh token not found for revocation")
        return False

    def revoke_all_user_tokens(self, user_id: str, db: Session) -> int:
        """
        Revoga todos os refresh tokens de um usuário.

        Args:
            user_id: ID do usuário
            db: Sessão do banco

        Returns:
            Número de tokens revogados
        """
        count = (
            db.query(RefreshToken)
            .filter(RefreshToken.user_id == user_id, RefreshToken.revoked == False)
            .update({"revoked": True})
        )
        db.commit()

        logger.info(f"Revoked {count} tokens for user {user_id}")
        return count

    def cleanup_expired_tokens(self, db: Session) -> int:
        """
        Remove tokens expirados do banco.

        Args:
            db: Sessão do banco

        Returns:
            Número de tokens removidos
        """
        count = db.query(RefreshToken).filter(RefreshToken.expires_at < datetime.utcnow()).delete()
        db.commit()

        logger.info(f"Cleaned up {count} expired tokens")
        return count


# Singleton instance
_token_service: Optional[TokenService] = None


def get_token_service() -> TokenService:
    """
    Retorna instância singleton do TokenService.

    Returns:
        Instância de TokenService
    """
    global _token_service
    if _token_service is None:
        _token_service = TokenService()
    return _token_service


# Atalho
token_service = get_token_service()
