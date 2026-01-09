"""
Redis configuration and client management.
"""

import redis.asyncio as redis
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

# Redis client singleton
_redis_client: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    """
    Get Redis client singleton.

    Returns:
        Redis client instance
    """
    global _redis_client

    if _redis_client is None:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        max_connections = int(os.getenv("REDIS_MAX_CONNECTIONS", "10"))

        try:
            _redis_client = await redis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=max_connections,
            )
            # Test connection
            await _redis_client.ping()
            logger.info(f"Redis connected: {redis_url}")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            # Return None to allow app to work without Redis
            _redis_client = None
            raise

    return _redis_client


async def close_redis():
    """Close Redis connection."""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
        logger.info("Redis connection closed")


async def health_check() -> bool:
    """
    Check Redis health.

    Returns:
        True if Redis is healthy
    """
    try:
        client = await get_redis()
        if client:
            await client.ping()
            return True
        return False
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return False
