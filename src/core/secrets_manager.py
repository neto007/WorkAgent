"""
Secrets Manager for secure credential management.
"""

import os
import base64
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import logging

logger = logging.getLogger(__name__)


class SecretsManager:
    """Gerenciador de secrets com criptografia"""

    def __init__(self):
        """Inicializa o secrets manager com chave de criptografia"""
        # Buscar chave de criptografia do ambiente
        encryption_key = os.getenv("ENCRYPTION_KEY")

        if not encryption_key:
            # Gerar chave se não existir (apenas para dev)
            logger.warning(
                "ENCRYPTION_KEY not set, generating temporary key. "
                "Set ENCRYPTION_KEY in production!"
            )
            encryption_key = Fernet.generate_key().decode()

        # Derivar chave usando PBKDF2 se necessário
        if len(encryption_key) < 32:
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b"evo-ai-salt",  # Em produção, usar salt único
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(encryption_key.encode()))
        else:
            key = encryption_key.encode()

        self.cipher = Fernet(key)

    def encrypt(self, value: str) -> str:
        """
        Criptografa um valor.

        Args:
            value: Valor a ser criptografado

        Returns:
            Valor criptografado em base64
        """
        if not value:
            return ""

        try:
            encrypted = self.cipher.encrypt(value.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            logger.error(f"Error encrypting value: {e}")
            raise

    def decrypt(self, encrypted_value: str) -> str:
        """
        Descriptografa um valor.

        Args:
            encrypted_value: Valor criptografado em base64

        Returns:
            Valor descriptografado
        """
        if not encrypted_value:
            return ""

        try:
            encrypted = base64.urlsafe_b64decode(encrypted_value.encode())
            decrypted = self.cipher.decrypt(encrypted)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Error decrypting value: {e}")
            raise

    def get_secret(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """
        Busca secret do ambiente.

        Args:
            key: Nome da variável de ambiente
            default: Valor padrão se não encontrado

        Returns:
            Valor do secret ou default
        """
        value = os.getenv(key, default)

        if value and value.startswith("encrypted:"):
            # Descriptografar se tiver prefixo
            try:
                return self.decrypt(value[10:])
            except Exception as e:
                logger.error(f"Error decrypting secret {key}: {e}")
                return default

        return value

    def set_secret_env(self, key: str, value: str, encrypt: bool = True) -> None:
        """
        Define secret no ambiente (apenas para testes).

        Args:
            key: Nome da variável
            value: Valor
            encrypt: Se deve criptografar
        """
        if encrypt:
            encrypted = self.encrypt(value)
            os.environ[key] = f"encrypted:{encrypted}"
        else:
            os.environ[key] = value


# Singleton instance
_secrets_manager: Optional[SecretsManager] = None


def get_secrets_manager() -> SecretsManager:
    """
    Retorna instância singleton do SecretsManager.

    Returns:
        Instância de SecretsManager
    """
    global _secrets_manager
    if _secrets_manager is None:
        _secrets_manager = SecretsManager()
    return _secrets_manager


# Atalho para facilitar uso
secrets_manager = get_secrets_manager()
