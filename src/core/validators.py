"""
Validadores reutilizáveis para input validation em toda a aplicação.
"""

import json
import re
from typing import Any


def validate_url(url: str) -> str:
    """
    Valida e sanitiza URLs.

    Args:
        url: URL a ser validada

    Returns:
        URL validada

    Raises:
        ValueError: Se a URL for inválida
    """
    url_pattern = re.compile(
        r"^https?://"  # http:// or https://
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"  # domain...
        r"localhost|"  # localhost...
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...or ip
        r"(?::\d+)?"  # optional port
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE,
    )

    if not url_pattern.match(url):
        raise ValueError(f"URL inválida: {url}")
    return url


def validate_json_size(data: Any, max_size_mb: float = 10) -> Any:
    """
    Valida tamanho de payloads JSON.

    Args:
        data: Dados a serem validados
        max_size_mb: Tamanho máximo em MB

    Returns:
        Dados validados

    Raises:
        ValueError: Se o payload for muito grande
    """
    size_bytes = len(json.dumps(data).encode("utf-8"))
    max_bytes = max_size_mb * 1024 * 1024

    if size_bytes > max_bytes:
        raise ValueError(
            f"Payload muito grande: {size_bytes / 1024 / 1024:.2f}MB (máx: {max_size_mb}MB)"
        )
    return data


def validate_email(email: str) -> str:
    """
    Valida formato de email.

    Args:
        email: Email a ser validado

    Returns:
        Email validado em lowercase

    Raises:
        ValueError: Se o email for inválido
    """
    email_pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

    if not email_pattern.match(email):
        raise ValueError(f"Email inválido: {email}")

    return email.lower()


def validate_string_length(
    value: str, min_length: int = 1, max_length: int = 255, field_name: str = "Campo"
) -> str:
    """
    Valida comprimento de string.

    Args:
        value: String a ser validada
        min_length: Comprimento mínimo
        max_length: Comprimento máximo
        field_name: Nome do campo para mensagens de erro

    Returns:
        String validada

    Raises:
        ValueError: Se o comprimento for inválido
    """
    if len(value) < min_length:
        raise ValueError(f"{field_name} deve ter pelo menos {min_length} caracteres")

    if len(value) > max_length:
        raise ValueError(f"{field_name} deve ter no máximo {max_length} caracteres")

    return value


def sanitize_filename(filename: str) -> str:
    """
    Sanitiza nome de arquivo removendo caracteres perigosos.

    Args:
        filename: Nome do arquivo

    Returns:
        Nome do arquivo sanitizado

    Raises:
        ValueError: Se o nome do arquivo for inválido
    """
    # Remove path traversal attempts
    filename = filename.replace("../", "").replace("..\\", "")

    # Allow only alphanumeric, dots, hyphens, underscores
    sanitized = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)

    if not sanitized or sanitized in [".", ".."]:
        raise ValueError(f"Nome de arquivo inválido: {filename}")

    return sanitized


def validate_dict_keys(
    data: dict[str, Any], required_keys: list[str], optional_keys: list[str] | None = None
) -> dict[str, Any]:
    """
    Valida que um dicionário contém as chaves necessárias.

    Args:
        data: Dicionário a ser validado
        required_keys: Chaves obrigatórias
        optional_keys: Chaves opcionais permitidas

    Returns:
        Dicionário validado

    Raises:
        ValueError: Se chaves obrigatórias estiverem faltando ou chaves inválidas presentes
    """
    missing_keys = set(required_keys) - set(data.keys())
    if missing_keys:
        raise ValueError(f"Chaves obrigatórias faltando: {', '.join(missing_keys)}")

    if optional_keys is not None:
        allowed_keys = set(required_keys) | set(optional_keys)
        extra_keys = set(data.keys()) - allowed_keys
        if extra_keys:
            raise ValueError(f"Chaves não permitidas: {', '.join(extra_keys)}")

    return data
