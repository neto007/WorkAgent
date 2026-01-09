from typing import Any

from fastapi import HTTPException


class BaseAPIException(HTTPException):
    """Base class for API exceptions"""

    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: str,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "error": message,
                "error_code": error_code,
                "details": details or {},
            },
        )


class AgentNotFoundError(BaseAPIException):
    """Exception when the agent is not found"""

    def __init__(self, agent_id: str):
        super().__init__(
            status_code=404,
            message=f"Agent with ID {agent_id} not found",
            error_code="AGENT_NOT_FOUND",
        )


class InvalidParameterError(BaseAPIException):
    """Exception for invalid parameters"""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(
            status_code=400,
            message=message,
            error_code="INVALID_PARAMETER",
            details=details,
        )


class InvalidRequestError(BaseAPIException):
    """Exception for invalid requests"""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(
            status_code=400,
            message=message,
            error_code="INVALID_REQUEST",
            details=details,
        )


class InternalServerError(BaseAPIException):
    """Exception for server errors"""

    def __init__(self, message: str = "Server error"):
        super().__init__(status_code=500, message=message, error_code="INTERNAL_SERVER_ERROR")


class ValidationError(BaseAPIException):
    """Exception for validation errors"""

    def __init__(self, message: str, field: str | None = None, details: dict | None = None):
        error_details = details or {}
        if field:
            error_details["field"] = field

        super().__init__(
            status_code=422,
            message=message,
            error_code="VALIDATION_ERROR",
            details=error_details,
        )


class ResourceNotFoundError(BaseAPIException):
    """Exception for resource not found"""

    def __init__(self, resource: str, identifier: str):
        super().__init__(
            status_code=404,
            message=f"{resource} não encontrado",
            error_code="RESOURCE_NOT_FOUND",
            details={"resource": resource, "identifier": identifier},
        )


class UnauthorizedError(BaseAPIException):
    """Exception for unauthorized access"""

    def __init__(self, message: str = "Não autorizado"):
        super().__init__(status_code=401, message=message, error_code="UNAUTHORIZED")


class ForbiddenError(BaseAPIException):
    """Exception for forbidden access"""

    def __init__(self, message: str = "Acesso negado", resource: str | None = None):
        details = {"resource": resource} if resource else None
        super().__init__(status_code=403, message=message, error_code="FORBIDDEN", details=details)


class ConflictError(BaseAPIException):
    """Exception for resource conflicts"""

    def __init__(self, message: str, resource: str | None = None):
        details = {"resource": resource} if resource else None
        super().__init__(status_code=409, message=message, error_code="CONFLICT", details=details)


class RateLimitError(BaseAPIException):
    """Exception for rate limit exceeded"""

    def __init__(
        self, message: str = "Limite de requisições excedido", retry_after: int | None = None
    ):
        details = {"retry_after": retry_after} if retry_after else None
        super().__init__(
            status_code=429, message=message, error_code="RATE_LIMIT_EXCEEDED", details=details
        )
