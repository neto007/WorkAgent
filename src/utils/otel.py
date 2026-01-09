import os
import base64
from src.config.settings import settings

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

_otlp_initialized = False


def init_otel():
    global _otlp_initialized
    if _otlp_initialized:
        return
    if not (
        settings.LANGFUSE_PUBLIC_KEY
        and settings.LANGFUSE_SECRET_KEY
        and settings.OTEL_EXPORTER_OTLP_ENDPOINT
    ):
        return

    try:
        langfuse_auth = base64.b64encode(
            f"{settings.LANGFUSE_PUBLIC_KEY}:{settings.LANGFUSE_SECRET_KEY}".encode()
        ).decode()
        
        # Configurações específicas para o exporter
        headers = {"Authorization": f"Basic {langfuse_auth}"}
        
        provider = TracerProvider(
            resource=Resource.create({"service.name": "evo_ai_agent"})
        )
        
        # Cria exporter com configurações específicas e timeout
        exporter = OTLPSpanExporter(
            endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT,
            headers=headers,
            timeout=30  # timeout de 30 segundos
        )
        
        # Configura o processor com configurações mais conservadoras
        processor = BatchSpanProcessor(
            exporter,
            max_queue_size=512,
            schedule_delay_millis=5000,  # 5 segundos
            max_export_batch_size=64
        )
        
        provider.add_span_processor(processor)
        trace.set_tracer_provider(provider)
        _otlp_initialized = True
        
    except Exception as e:
        # Em caso de erro, continua sem OTLP
        print(f"Warning: Failed to initialize OTLP: {e}")
        # Configura um provider básico sem exporter
        provider = TracerProvider(
            resource=Resource.create({"service.name": "evo_ai_agent"})
        )
        trace.set_tracer_provider(provider)
        _otlp_initialized = True


def get_tracer(name: str = "evo_ai_agent"):
    return trace.get_tracer(name)
