from typing import List, Optional, Dict, Union, Any
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
import secrets
import string
import uuid
from pydantic import validator


class ToolConfig(BaseModel):
    """Configuration of a tool"""

    id: UUID
    envs: Dict[str, str] = Field(
        default_factory=dict, description="Environment variables of the tool"
    )

    model_config = ConfigDict(from_attributes=True)


class MCPServerConfig(BaseModel):
    """Configuration of an MCP server"""

    id: UUID
    envs: Dict[str, str] = Field(
        default_factory=dict, description="Environment variables of the server"
    )
    tools: List[str] = Field(
        default_factory=list, description="List of tools of the server"
    )

    model_config = ConfigDict(from_attributes=True)


class CustomMCPServerConfig(BaseModel):
    """Configuration of a custom MCP server"""

    url: str = Field(..., description="Server URL of the custom MCP server")
    headers: Dict[str, str] = Field(
        default_factory=dict, description="Headers for requests to the server"
    )

    model_config = ConfigDict(from_attributes=True)


class FlowNodes(BaseModel):
    """Configuration of workflow nodes"""

    nodes: List[Any]
    edges: List[Any]


class HTTPToolParameter(BaseModel):
    """Parameter of an HTTP tool"""

    type: str
    required: bool
    description: str

    model_config = ConfigDict(from_attributes=True)


class HTTPToolParameters(BaseModel):
    """Parameters of an HTTP tool"""

    path_params: Optional[Dict[str, str]] = None
    query_params: Optional[Dict[str, Union[str, List[str]]]] = None
    body_params: Optional[Dict[str, HTTPToolParameter]] = None

    model_config = ConfigDict(from_attributes=True)


class HTTPToolErrorHandling(BaseModel):
    """Configuration of error handling"""

    timeout: int
    retry_count: int
    fallback_response: Dict[str, str]

    model_config = ConfigDict(from_attributes=True)


class HTTPTool(BaseModel):
    """Configuration of an HTTP tool"""

    name: str
    method: str
    values: Dict[str, str]
    headers: Dict[str, str]
    endpoint: str
    parameters: HTTPToolParameters
    description: str
    error_handling: HTTPToolErrorHandling

    model_config = ConfigDict(from_attributes=True)


class CustomTools(BaseModel):
    """Configuration of custom tools"""

    http_tools: List[HTTPTool] = Field(
        default_factory=list, description="List of HTTP tools"
    )

    model_config = ConfigDict(from_attributes=True)


def generate_api_key(length: int = 32) -> str:
    """Generate a secure API key."""
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


class LLMConfig(BaseModel):
    """Configuration for LLM agents"""

    api_key: str = Field(
        default_factory=generate_api_key,
        description="API key for the LLM. If not provided, a secure key will be generated automatically.",
    )

    tools: Optional[List[ToolConfig]] = Field(
        default=None, description="List of available tools"
    )
    custom_tools: Optional[CustomTools] = Field(
        default=None, description="Custom tools"
    )
    mcp_servers: Optional[List[MCPServerConfig]] = Field(
        default=None, description="List of MCP servers"
    )
    custom_mcp_servers: Optional[List[CustomMCPServerConfig]] = Field(
        default=None, description="List of custom MCP servers with URL and headers"
    )
    agent_tools: Optional[List[UUID]] = Field(
        default=None, description="List of IDs of sub-agents"
    )
    sub_agents: Optional[List[UUID]] = Field(
        default=None, description="List of IDs of sub-agents"
    )
    workflow: Optional[FlowNodes] = Field(
        default=None, description="Workflow configuration"
    )

    model_config = ConfigDict(from_attributes=True)


class SequentialConfig(BaseModel):
    """Configuration for sequential agents"""

    sub_agents: List[UUID] = Field(
        ..., description="List of IDs of sub-agents in execution order"
    )

    model_config = ConfigDict(from_attributes=True)


class ParallelConfig(BaseModel):
    """Configuration for parallel agents"""

    sub_agents: List[UUID] = Field(
        ..., description="List of IDs of sub-agents for parallel execution"
    )

    model_config = ConfigDict(from_attributes=True)


class LoopConfig(BaseModel):
    """Configuration for loop agents"""

    sub_agents: List[UUID] = Field(
        ..., description="List of IDs of sub-agents for loop execution"
    )
    max_iterations: Optional[int] = Field(
        default=None, description="Maximum number of iterations"
    )
    condition: Optional[str] = Field(
        default=None, description="Condition to stop the loop"
    )

    model_config = ConfigDict(from_attributes=True)


class WorkflowConfig(BaseModel):
    """Configuration for workflow agents"""

    workflow: Dict[str, Any] = Field(
        ..., description="Workflow configuration with nodes and edges"
    )
    sub_agents: Optional[List[UUID]] = Field(
        default_factory=list, description="List of IDs of sub-agents used in workflow"
    )
    api_key: Optional[str] = Field(
        default_factory=generate_api_key, description="API key for the workflow agent"
    )

    model_config = ConfigDict(from_attributes=True)


class AgentTask(BaseModel):
    """Task configuration for agents"""

    agent_id: Union[UUID, str] = Field(
        ..., description="ID of the agent assigned to this task"
    )
    enabled_tools: Optional[List[str]] = Field(
        default_factory=list, description="List of tool names to be used in the task"
    )
    description: str = Field(..., description="Description of the task to be performed")
    expected_output: str = Field(..., description="Expected output from this task")

    @validator("agent_id")
    def validate_agent_id(cls, v):
        if isinstance(v, str):
            try:
                return uuid.UUID(v)
            except ValueError:
                raise ValueError(f"Invalid UUID format for agent_id: {v}")
        return v

    model_config = ConfigDict(from_attributes=True)


class AgentConfig(BaseModel):
    """Configuration for agents"""

    tasks: List[AgentTask] = Field(
        ..., description="List of tasks to be performed by the agent"
    )
    api_key: Optional[str] = Field(
        default_factory=generate_api_key, description="API key for the agent"
    )
    sub_agents: Optional[List[UUID]] = Field(
        default_factory=list, description="List of IDs of sub-agents used in agent"
    )

    model_config = ConfigDict(from_attributes=True)
