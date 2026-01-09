import re
import uuid
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import UUID4, BaseModel, ConfigDict, Field, validator

from src.schemas.agent_config import LLMConfig


class ClientBase(BaseModel):
    name: str
    email: str | None = None

    @validator("email")
    def validate_email(cls, v):
        if v is None:
            return v
        # Email validation removed for local service usage
        return v


class ClientCreate(ClientBase):
    pass


class Client(ClientBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApiKeyBase(BaseModel):
    name: str
    provider: str


class ApiKeyCreate(ApiKeyBase):
    client_id: UUID4
    key_value: str


class ApiKeyUpdate(BaseModel):
    name: str | None = None
    provider: str | None = None
    key_value: str | None = None
    is_active: bool | None = None


class ApiKey(ApiKeyBase):
    id: UUID4
    client_id: UUID4
    created_at: datetime
    updated_at: datetime | None = None
    is_active: bool
    key_value_masked: str | None = Field(
        default="*****", description="Masked API key value for display"
    )

    model_config = ConfigDict(from_attributes=True)


class AgentBase(BaseModel):
    name: str | None = Field(None, description="Agent name (no spaces or special characters)")
    description: str | None = Field(None, description="Agent description")
    role: str | None = Field(None, description="Agent role in the system")
    goal: str | None = Field(None, description="Agent goal or objective")
    type: str = Field(
        ...,
        description="Agent type (llm, sequential, parallel, loop, a2a, workflow, task)",
    )
    model: str | None = Field(None, description="Agent model (required only for llm type)")
    api_key_id: UUID4 | None = Field(None, description="Reference to a stored API Key ID")
    instruction: str | None = None
    agent_card_url: str | None = Field(
        None, description="Agent card URL (required for a2a type)"
    )
    folder_id: UUID4 | None = Field(None, description="ID of the folder this agent belongs to")
    config: Any = Field(None, description="Agent configuration based on type")

    @validator("name")
    def validate_name(cls, v, values):
        if values.get("type") == "a2a":
            return v

        if not v:
            raise ValueError("Name is required for non-a2a agent types")

        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Agent name cannot contain spaces or special characters")
        return v

    @validator("type")
    def validate_type(cls, v):
        if v not in [
            "llm",
            "sequential",
            "parallel",
            "loop",
            "a2a",
            "workflow",
            "task",
        ]:
            raise ValueError(
                "Invalid agent type. Must be: llm, sequential, parallel, loop, a2a, workflow or task"
            )
        return v

    @validator("agent_card_url")
    def validate_agent_card_url(cls, v, values):
        if "type" in values and values["type"] == "a2a":
            if not v:
                raise ValueError("agent_card_url is required for a2a type agents")
            if not v.endswith("/.well-known/agent.json"):
                raise ValueError("agent_card_url must end with /.well-known/agent.json")
        return v

    @validator("model")
    def validate_model(cls, v, values):
        if "type" in values and values["type"] == "llm" and not v:
            raise ValueError("Model is required for llm type agents")
        return v

    @validator("api_key_id")
    def validate_api_key_id(cls, v, values):
        return v

    @validator("config")
    def validate_config(cls, v, values):
        if "type" in values and values["type"] == "a2a":
            return v or {}

        if "type" not in values:
            return v

        # For workflow agents, skip validation on read (allow existing invalid data)
        # Validation will be applied in AgentCreate/AgentUpdate
        if values["type"] == "workflow":
            return v

        if not v and values.get("type") != "a2a":
            raise ValueError(f"Configuration is required for {values.get('type')} agent type")

        if values["type"] == "llm":
            if isinstance(v, dict):
                try:
                    # Convert the dictionary to LLMConfig
                    v = LLMConfig(**v)
                except Exception as e:
                    raise ValueError(f"Invalid LLM configuration for agent: {str(e)}")
            elif not isinstance(v, LLMConfig):
                raise ValueError("Invalid LLM configuration for agent")
        elif values["type"] in ["sequential", "parallel", "loop"]:
            if not isinstance(v, dict):
                raise ValueError(f'Invalid configuration for agent {values["type"]}')
            if "sub_agents" not in v:
                raise ValueError(f'Agent {values["type"]} must have sub_agents')
            if not isinstance(v["sub_agents"], list):
                raise ValueError("sub_agents must be a list")
            if not v["sub_agents"]:
                raise ValueError(f'Agent {values["type"]} must have at least one sub-agent')
        elif values["type"] == "task":
            if not isinstance(v, dict):
                raise ValueError(f'Invalid configuration for agent {values["type"]}')
            if "tasks" not in v:
                raise ValueError(f'Agent {values["type"]} must have tasks')
            if not isinstance(v["tasks"], list):
                raise ValueError("tasks must be a list")
            if not v["tasks"]:
                raise ValueError(f'Agent {values["type"]} must have at least one task')
            for task in v["tasks"]:
                if not isinstance(task, dict):
                    raise ValueError("Each task must be a dictionary")
                required_fields = ["agent_id", "description", "expected_output"]
                for field in required_fields:
                    if field not in task:
                        raise ValueError(f"Task missing required field: {field}")

            if "sub_agents" in v and v["sub_agents"] is not None:
                if not isinstance(v["sub_agents"], list):
                    raise ValueError("sub_agents must be a list")

            return v

        return v


class AgentCreate(AgentBase):
    client_id: UUID

    @validator("config")
    def validate_workflow_on_create(cls, v, values):
        """Validate workflow agents have proper configuration on creation."""
        if values.get("type") == "workflow":
            if not v:
                raise ValueError("Configuration is required for workflow agent type")
            if not isinstance(v, dict):
                raise ValueError("Invalid configuration for workflow agent")

            # workflow field is required but can be empty dict initially
            if "workflow" in v and v["workflow"]:
                workflow = v["workflow"]
                if not isinstance(workflow, dict):
                    raise ValueError("workflow must be a dictionary")

                # If nodes/edges are provided, they must be lists
                if "nodes" in workflow and not isinstance(workflow["nodes"], list):
                    raise ValueError("workflow.nodes must be a list")
                if "edges" in workflow and not isinstance(workflow["edges"], list):
                    raise ValueError("workflow.edges must be a list")

        return v


class Agent(AgentBase):
    id: UUID
    client_id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    agent_card_url: str | None = None
    avatar_url: str | None = None
    folder_id: UUID4 | None = None

    model_config = ConfigDict(from_attributes=True)

    @validator("agent_card_url", pre=True)
    def set_agent_card_url(cls, v, values):
        if v:
            return v

        if "id" in values:
            from os import getenv

            return f"{getenv('API_URL', '')}/api/v1/a2a/{values['id']}/.well-known/agent.json"

        return v


class ToolConfig(BaseModel):
    id: str
    name: str
    description: str
    tags: list[str] = Field(default_factory=list)
    examples: list[str] = Field(default_factory=list)
    inputModes: list[str] = Field(default_factory=list)
    outputModes: list[str] = Field(default_factory=list)


# Last edited by Arley Peter on 2025-05-17
class MCPServerBase(BaseModel):
    name: str
    description: str | None = None
    config_type: str = Field(default="studio")
    config_json: dict[str, Any] = Field(default_factory=dict)
    environments: dict[str, Any] = Field(default_factory=dict)
    tools: list[ToolConfig] | None = Field(default_factory=list)
    type: str = Field(default="official")


class MCPServerCreate(MCPServerBase):
    pass


class MCPServer(MCPServerBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ToolBase(BaseModel):
    name: str
    description: str | None = None
    config_json: dict[str, Any] = Field(default_factory=dict)
    environments: dict[str, Any] = Field(default_factory=dict)


class ToolCreate(ToolBase):
    pass


class Tool(ToolBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class AgentFolderBase(BaseModel):
    name: str
    description: str | None = None


class AgentFolderCreate(AgentFolderBase):
    client_id: UUID4


class AgentFolderUpdate(AgentFolderBase):
    pass


class AgentFolder(AgentFolderBase):
    id: UUID4
    client_id: UUID4
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
