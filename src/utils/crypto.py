from src.core.secrets_manager import secrets_manager
import logging

logger = logging.getLogger(__name__)


def encrypt_api_key(api_key: str) -> str:
    """Encrypt an API key before saving in the database using SecretsManager"""
    if not api_key:
        return ""
    try:
        return secrets_manager.encrypt(api_key)
    except Exception as e:
        logger.error(f"Error encrypting API key: {str(e)}")
        raise


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt an API key for use using SecretsManager"""
    if not encrypted_key:
        return ""
    try:
        return secrets_manager.decrypt(encrypted_key)
    except Exception as e:
        logger.error(f"Error decrypting API key: {str(e)}")
        raise
