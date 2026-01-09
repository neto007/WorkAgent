import api from "./api";
import { type MCPServer, type MCPServerCreate } from "@/types/mcpServer";

export const listMCPServers = (_clientId?: string) =>
    api.get<MCPServer[]>("/api/v1/mcp-servers/");

export const createMCPServer = (data: MCPServerCreate) =>
    api.post<MCPServer>("/api/v1/mcp-servers/", data);

export const getMCPServer = (id: string) =>
    api.get<MCPServer>(`/api/v1/mcp-servers/${id}`);

export const updateMCPServer = (id: string, data: MCPServerCreate) =>
    api.put<MCPServer>(`/api/v1/mcp-servers/${id}`, data);

export const deleteMCPServer = (id: string) =>
    api.delete(`/api/v1/mcp-servers/${id}`);
