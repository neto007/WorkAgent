#!/usr/bin/env python3
"""
Monitoramento Langfuse para o Sistema EvoAI
Integração com agentes, LLMs e ferramentas
"""

import functools
import logging
import os
from collections.abc import Callable
from typing import Any

from dotenv import load_dotenv
from langfuse import Langfuse
from langfuse.langchain import CallbackHandler

# Carregar variáveis de ambiente
load_dotenv()

logger = logging.getLogger(__name__)


class LangfuseMonitor:
    """Monitor centralizado para integração com Langfuse"""

    def __init__(self):
        self.public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
        self.secret_key = os.getenv("LANGFUSE_SECRET_KEY")
        self.host = os.getenv("LANGFUSE_HOST", "http://localhost:3001")

        self.client = None
        self.callback_handler = None
        self._initialize_client()

    def _initialize_client(self):
        """Inicializa o cliente Langfuse com tratamento de erro"""
        try:
            if self.public_key and self.secret_key:
                self.client = Langfuse(
                    public_key=self.public_key, secret_key=self.secret_key, host=self.host
                )
                self.callback_handler = CallbackHandler()
                logger.info(f"Langfuse inicializado: {self.host}")
            else:
                logger.warning("Credenciais Langfuse não encontradas")
        except Exception as e:
            logger.error(f"Erro ao inicializar Langfuse: {e}")

    @property
    def is_enabled(self) -> bool:
        """Verifica se o monitoramento está habilitado"""
        return self.client is not None

    def get_callback_handler(self) -> CallbackHandler | None:
        """Retorna o callback handler para Langchain"""
        return self.callback_handler if self.is_enabled else None

    def start_session(self, session_id: str, user_id: str = None, metadata: dict[str, Any] = None):
        """Inicia uma sessão de monitoramento"""
        if not self.is_enabled:
            return None

        try:
            span = self.client.start_span(
                name="evo_ai_session",
                metadata={
                    "session_id": session_id,
                    "user_id": user_id,
                    "system": "evo_ai",
                    **(metadata or {}),
                },
            )
            logger.debug(f"Sessão iniciada: {session_id}")
            return span
        except Exception as e:
            logger.error(f"Erro ao iniciar sessão: {e}")
            return None

    def log_llm_call(
        self,
        model: str,
        input_text: str,
        output_text: str,
        metadata: dict[str, Any] = None,
        session_id: str = None,
    ):
        """Registra uma chamada de LLM"""
        if not self.is_enabled:
            return None

        try:
            generation = self.client.start_generation(
                name=f"llm_{model}",
                model=model,
                input=input_text,
                metadata={"session_id": session_id, **(metadata or {})},
            )
            generation.end(output=output_text)
            logger.debug(f"LLM call registrada: {model}")
            return generation
        except Exception as e:
            logger.error(f"Erro ao registrar LLM call: {e}")
            return None

    def log_tool_usage(
        self,
        tool_name: str,
        input_params: dict[str, Any],
        output_result: Any,
        session_id: str = None,
    ):
        """Registra o uso de uma ferramenta"""
        if not self.is_enabled:
            return None

        try:
            span = self.client.start_span(
                name=f"tool_{tool_name}",
                metadata={
                    "tool_name": tool_name,
                    "session_id": session_id,
                    "input_params": input_params,
                },
            )
            span.end(output=str(output_result))
            logger.debug(f"Tool usage registrado: {tool_name}")
            return span
        except Exception as e:
            logger.error(f"Erro ao registrar tool usage: {e}")
            return None

    def log_event(self, event_name: str, metadata: dict[str, Any] = None, session_id: str = None):
        """Registra um evento personalizado"""
        if not self.is_enabled:
            return None

        try:
            event = self.client.create_event(
                name=event_name, metadata={"session_id": session_id, **(metadata or {})}
            )
            logger.debug(f"Evento registrado: {event_name}")
            return event
        except Exception as e:
            logger.error(f"Erro ao registrar evento: {e}")
            return None

    def flush(self):
        """Força o envio de dados pendentes"""
        if self.is_enabled:
            try:
                self.client.flush()
                logger.debug("Dados enviados para Langfuse")
            except Exception as e:
                logger.error(f"Erro no flush: {e}")


# Instância global
langfuse_monitor = LangfuseMonitor()


# Decoradores para monitoramento automático
def monitor_llm(model_name: str = None, session_id: str = None):
    """Decorator para monitorar chamadas de LLM automaticamente"""

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extrair informações da chamada
            model = model_name or kwargs.get("model", "unknown")
            input_text = str(args[0]) if args else str(kwargs.get("input", ""))

            # Executar função
            result = func(*args, **kwargs)

            # Registrar no Langfuse
            langfuse_monitor.log_llm_call(
                model=model, input_text=input_text, output_text=str(result), session_id=session_id
            )

            return result

        return wrapper

    return decorator


def monitor_tool(tool_name: str = None, session_id: str = None):
    """Decorator para monitorar uso de ferramentas automaticamente"""

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extrair nome da ferramenta
            name = tool_name or func.__name__

            # Executar função
            result = func(*args, **kwargs)

            # Registrar no Langfuse
            langfuse_monitor.log_tool_usage(
                tool_name=name,
                input_params={
                    "args": str(args)[:200],  # Limitar tamanho
                    "kwargs": {k: str(v)[:100] for k, v in kwargs.items()},
                },
                output_result=str(result)[:500],  # Limitar tamanho
                session_id=session_id,
            )

            return result

        return wrapper

    return decorator


# Funções de conveniência
def get_langchain_callback():
    """Retorna callback handler para Langchain"""
    return langfuse_monitor.get_callback_handler()


def start_monitoring_session(session_id: str, user_id: str = None, metadata: dict[str, Any] = None):
    """Inicia uma nova sessão de monitoramento"""
    return langfuse_monitor.start_session(session_id, user_id, metadata)


def log_agent_action(action: str, details: dict[str, Any] = None, session_id: str = None):
    """Registra uma ação do agente"""
    return langfuse_monitor.log_event(
        event_name=f"agent_action_{action}", metadata=details, session_id=session_id
    )


def flush_monitoring_data():
    """Força o envio de dados de monitoramento"""
    langfuse_monitor.flush()


# Exemplo de uso
if __name__ == "__main__":
    print("=== Langfuse Monitor para EvoAI ===")
    print(f"Status: {'✓ Habilitado' if langfuse_monitor.is_enabled else '✗ Desabilitado'}")
    print(f"Host: {langfuse_monitor.host}")

    if langfuse_monitor.is_enabled:
        # Teste básico
        session = start_monitoring_session("test_session", "test_user")
        log_agent_action("test_action", {"test": True}, "test_session")
        flush_monitoring_data()
        print("✓ Teste de monitoramento executado")
    else:
        print("⚠ Configure as variáveis LANGFUSE_PUBLIC_KEY e LANGFUSE_SECRET_KEY")
