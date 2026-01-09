/*
* @author: Davidson Gomes
* @file: /services/agentService.ts
*/
import api from "./api";
// import { format } from "date-fns";
import type { Agent, AgentCreate } from "../types/agent";

// Helper function to escape braces in prompt if needed (simulated for now)
const escapePromptBraces = (text: string) => text;

// Helper function to sanitize agent name (simulated for now)
const sanitizeAgentName = (name: string) => name.trim();

const processAgentData = (data: AgentCreate | Partial<AgentCreate>): AgentCreate | Partial<AgentCreate> => {
    const updatedData = { ...data };

    if (updatedData.instruction) {
        updatedData.instruction = escapePromptBraces(updatedData.instruction);
    }

    if (updatedData.name) {
        updatedData.name = sanitizeAgentName(updatedData.name);
    }

    return updatedData;
};

// Original functions (kept for compatibility, redirecting to new implementations where possible)

export const createAgent = (data: AgentCreate) =>
    api.post<Agent>("/api/v1/agents/", processAgentData(data));

export const getAgents = () =>
    api.get<Agent[]>("/api/v1/agents/"); // Keeping old compatibility for now

export const listAgents = (
    clientId: string,
    skip = 0,
    limit = 100,
    folderId?: string
) => {
    const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
    });

    if (folderId) {
        queryParams.append("folder_id", folderId);
    }

    return api.get<Agent[]>(`/api/v1/agents/?${queryParams.toString()}`, {
        headers: { "x-client-id": clientId },
    });
};

export const getAgent = (agentId: string, clientId: string) =>
    api.get<Agent>(`/api/v1/agents/${agentId}`, {
        headers: { "x-client-id": clientId },
    });

export const getSharedAgent = (agentId: string) =>
    api.get<Agent>(`/api/v1/agents/${agentId}/shared`);

export const updateAgent = (agentId: string, data: Partial<AgentCreate>) =>
    api.put<Agent>(`/api/v1/agents/${agentId}`, processAgentData(data));

export const deleteAgent = (agentId: string) =>
    api.delete(`/api/v1/agents/${agentId}`);

// New functions for the folder system

export interface Folder {
    id: string;
    name: string;
    description: string;
    client_id: string;
    created_at: string;
    updated_at: string;
}

export interface FolderCreate {
    name: string;
    description: string;
    client_id: string;
}

export interface FolderUpdate {
    name?: string;
    description?: string;
}

export const createFolder = (data: FolderCreate) =>
    api.post<Folder>("/api/v1/agents/folders", data);

export const listFolders = (clientId: string, skip = 0, limit = 100) =>
    api.get<Folder[]>(`/api/v1/agents/folders?skip=${skip}&limit=${limit}`, {
        headers: { "x-client-id": clientId },
    });

export const getFolder = (folderId: string, clientId: string) =>
    api.get<Folder>(`/api/v1/agents/folders/${folderId}`, {
        headers: { "x-client-id": clientId },
    });

export const updateFolder = (
    folderId: string,
    data: FolderUpdate,
    clientId: string
) =>
    api.put<Folder>(`/api/v1/agents/folders/${folderId}`, data, {
        headers: { "x-client-id": clientId },
    });

export const deleteFolder = (folderId: string, clientId: string) =>
    api.delete(`/api/v1/agents/folders/${folderId}`, {
        headers: { "x-client-id": clientId },
    });

export const listAgentsInFolder = (
    folderId: string,
    clientId: string,
    skip = 0,
    limit = 100
) =>
    api.get<Agent[]>(
        `/api/v1/agents/folders/${folderId}/agents?skip=${skip}&limit=${limit}`,
        {
            headers: { "x-client-id": clientId },
        }
    );

export const assignAgentToFolder = (
    agentId: string,
    folderId: string | null,
    clientId: string
) => {
    const url = folderId
        ? `/api/v1/agents/${agentId}/folder?folder_id=${folderId}`
        : `/api/v1/agents/${agentId}/folder`;

    return api.put<Agent>(
        url,
        {},
        {
            headers: { "x-client-id": clientId },
        }
    );
};

export const shareAgent = (agentId: string, clientId: string) =>
    api.post<{ api_key: string }>(`/api/v1/agents/${agentId}/share`, {}, {
        headers: { "x-client-id": clientId },
    });

// API Key Interfaces and Services

export interface ApiKey {
    id: string;
    name: string;
    provider: string;
    client_id: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    key_value_masked?: string;
}

export interface ApiKeyCreate {
    name: string;
    provider: string;
    client_id: string;
    key_value: string;
}

export interface ApiKeyUpdate {
    name?: string;
    provider?: string;
    key_value?: string;
    is_active?: boolean;
}

export const createApiKey = (data: ApiKeyCreate) =>
    api.post<ApiKey>("/api/v1/agents/apikeys", data);

export const listApiKeys = (clientId: string, skip = 0, limit = 100) =>
    api.get<ApiKey[]>(`/api/v1/agents/apikeys?skip=${skip}&limit=${limit}`, {
        headers: { "x-client-id": clientId },
    });

export const getApiKey = (keyId: string, clientId: string) =>
    api.get<ApiKey>(`/api/v1/agents/apikeys/${keyId}`, {
        headers: { "x-client-id": clientId },
    });

export const updateApiKey = (
    keyId: string,
    data: ApiKeyUpdate,
    clientId: string
) =>
    api.put<ApiKey>(`/api/v1/agents/apikeys/${keyId}`, data, {
        headers: { "x-client-id": clientId },
    });

export const deleteApiKey = (keyId: string, clientId: string) =>
    api.delete(`/api/v1/agents/apikeys/${keyId}`, {
        headers: { "x-client-id": clientId },
    });

export const getApiKeyValue = (keyId: string, clientId: string) =>
    api.get<{ key_value: string }>(`/api/v1/agents/apikeys/${keyId}/value`, {
        headers: { "x-client-id": clientId },
    });

// Import agent from JSON file
export const importAgentFromJson = (file: File, clientId: string, folderId?: string | null) => {
    const formData = new FormData();
    formData.append('file', file);

    // Add folder_id to formData if it exists
    if (folderId) {
        formData.append('folder_id', folderId);
    }

    return api.post('/api/v1/agents/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-client-id': clientId
        }
    });
};

// Update agent workflow
export const updateWorkflow = (agentId: string, workflow: any) =>
    api.put(`/api/v1/agents/${agentId}/workflow`, { workflow });
