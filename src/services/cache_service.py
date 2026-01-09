"""
Cache Service for Redis-based caching.
"""

import json
import hashlib
from typing import Any, Optional, Callable
from functools import wraps
import logging
from src.config.redis import get_redis

logger = logging.getLogger(__name__)


class CacheService:
    """Service para gerenciamento de cache Redis"""

    # TTL padrões (em segundos)
    TTL_SHORT = 60  # 1 minuto
    TTL_MEDIUM = 300  # 5 minutos
    TTL_LONG = 3600  # 1 hora
    TTL_VERY_LONG = 86400  # 24 horas

    @staticmethod
    def generate_key(prefix: str, *args, **kwargs) -> str:
        """
        Gera chave de cache baseada em argumentos.

        Args:
            prefix: Prefixo da chave
            *args: Argumentos posicionais
            **kwargs: Argumentos nomeados

        Returns:
            Chave de cache única
        """
        # Criar string única dos argumentos
        key_data = f"{prefix}:{args}:{sorted(kwargs.items())}"
        # Hash para chave curta
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"{prefix}:{key_hash}"

    @staticmethod
    async def get(key: str) -> Optional[Any]:
        """
        Busca valor do cache.

        Args:
            key: Chave do cache

        Returns:
            Valor do cache ou None se não encontrado
        """
        try:
            redis_client = await get_redis()
            if not redis_client:
                return None

            value = await redis_client.get(key)

            if value:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(value)

            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    @staticmethod
    async def set(key: str, value: Any, ttl: int = None) -> bool:
        """
        Salva valor no cache.

        Args:
            key: Chave do cache
            value: Valor a ser salvo
            ttl: Time to live em segundos (default: TTL_MEDIUM)

        Returns:
            True se salvou com sucesso
        """
        if ttl is None:
            ttl = CacheService.TTL_MEDIUM

        try:
            redis_client = await get_redis()
            if not redis_client:
                return False

            serialized = json.dumps(value, default=str)
            await redis_client.setex(key, ttl, serialized)
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False

    @staticmethod
    async def delete(key: str) -> bool:
        """
        Remove valor do cache.

        Args:
            key: Chave do cache

        Returns:
            True se removeu com sucesso
        """
        try:
            redis_client = await get_redis()
            if not redis_client:
                return False

            await redis_client.delete(key)
            logger.debug(f"Cache DELETE: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False

    @staticmethod
    async def delete_pattern(pattern: str) -> int:
        """
        Remove todas as chaves que correspondem ao padrão.

        Args:
            pattern: Padrão de chaves (ex: "agents:*")

        Returns:
            Número de chaves removidas
        """
        try:
            redis_client = await get_redis()
            if not redis_client:
                return 0

            keys = await redis_client.keys(pattern)
            if keys:
                count = await redis_client.delete(*keys)
                logger.info(f"Cache DELETE pattern {pattern}: {count} keys")
                return count
            return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {e}")
            return 0

    @staticmethod
    async def exists(key: str) -> bool:
        """
        Verifica se chave existe no cache.

        Args:
            key: Chave do cache

        Returns:
            True se existe
        """
        try:
            redis_client = await get_redis()
            if not redis_client:
                return False

            return await redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Cache exists error for key {key}: {e}")
            return False


def cached(prefix: str, ttl: int = None):
    """
    Decorator para cache automático de funções.

    Args:
        prefix: Prefixo da chave de cache
        ttl: Time to live em segundos

    Usage:
        @cached("agents", ttl=300)
        async def get_agents(client_id: str):
            return db.query(Agent).filter_by(client_id=client_id).all()
    """
    if ttl is None:
        ttl = CacheService.TTL_MEDIUM

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Gerar chave de cache
            cache_key = CacheService.generate_key(prefix, *args, **kwargs)

            # Tentar buscar do cache
            cached_value = await CacheService.get(cache_key)
            if cached_value is not None:
                return cached_value

            # Executar função
            result = await func(*args, **kwargs)

            # Salvar no cache
            if result is not None:
                await CacheService.set(cache_key, result, ttl)

            return result

        return wrapper

    return decorator


# Singleton instance
cache_service = CacheService()
