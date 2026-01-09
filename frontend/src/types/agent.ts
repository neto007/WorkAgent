/*
* @author: Davidson Gomes
* @file: /types/agent.ts
*/
export const AgentType = {
    LLM: "llm" as const,
    A2A: "a2a" as const,
    SEQUENTIAL: "sequential" as const,
    PARALLEL: "parallel" as const,
    LOOP: "loop" as const,
    WORKFLOW: "workflow" as const,
    TASK: "task" as const
} as const;

export type AgentType = typeof AgentType[keyof typeof AgentType];

export interface ToolConfig {
    id: string;
    envs: Record<string, string>;
}

export interface MCPServerConfig {
    id: string;
    envs: Record<string, string>;
    tools: string[];
    selected_tools?: string[];
}

export interface CustomMCPServer {
    url: string;
    headers?: Record<string, string>;
}

export interface HTTPToolParameter {
    type: string;
    required: boolean;
    description: string;
}

export interface HTTPToolParameters {
    path_params?: Record<string, string>;
    query_params?: Record<string, string | string[]>;
    body_params?: Record<string, HTTPToolParameter>;
}

export interface HTTPToolErrorHandling {
    timeout: number;
    retry_count: number;
    fallback_response: Record<string, string>;
}

export interface HTTPTool {
    name: string;
    method: string;
    values: Record<string, string>;
    headers: Record<string, string>;
    endpoint: string;
    parameters: HTTPToolParameters;
    description: string;
    error_handling: HTTPToolErrorHandling;
}

export interface CustomTools {
    http_tools: HTTPTool[];
}

export interface WorkflowData {
    nodes: any[];
    edges: any[];
}

export interface TaskConfig {
    agent_id: string;
    description: string;
    expected_output: string;
    enabled_tools?: string[];
}

export interface AgentConfig {
    // LLM config
    api_key?: string;
    temperature?: number;
    tools?: ToolConfig[];
    custom_tools?: CustomTools;
    mcp_servers?: MCPServerConfig[];
    custom_mcp_servers?: CustomMCPServer[];

    // Sequential, Parallel e Loop config
    sub_agents?: string[];
    agent_tools?: string[];

    // Loop config
    max_iterations?: number;

    // Workflow config
    workflow?: WorkflowData;

    // Task config
    tasks?: TaskConfig[];
}

export interface Agent {
    id: string;
    client_id: string;
    folder_id?: string;
    name: string;
    description?: string;
    role?: string;
    goal?: string;
    type: AgentType;
    model?: string;
    api_key_id?: string;
    instruction?: string;
    agent_card_url?: string;
    avatar_url?: string;
    config?: AgentConfig;
    tasks?: TaskConfig[];
    created_at: string;
    updated_at?: string;
    agent_type?: AgentType; // Optional Compatibility with older code
    model_name?: string; // Optional Compatibility with older code
    temperature?: number; // Optional Compatibility with older code
    system_prompt?: string; // Optional Compatibility with older code
}

export interface AgentCreate {
    client_id: string;
    name: string;
    description?: string;
    role?: string;
    goal?: string;
    type: AgentType;
    model?: string;
    api_key_id?: string;
    instruction?: string;
    agent_card_url?: string;
    config?: AgentConfig;
    agent_type?: AgentType; // Optional Compatibility with older code
    model_name?: string; // Optional Compatibility with older code
    temperature?: number; // Optional Compatibility with older code
    system_prompt?: string; // Optional Compatibility with older code
}
