import api from "./api";

import type { Message, ChatSession } from "@/types/chat";

export type ChatMessage = Message;
export { type ChatSession };

export const generateExternalId = () => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
        2,
        "0"
    )}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(
        2,
        "0"
    )}${String(now.getMinutes()).padStart(2, "0")}${String(
        now.getSeconds()
    ).padStart(2, "0")}`;
};

export const listSessions = (clientId: string) =>
    api.get<ChatSession[]>(`/api/v1/sessions/client/${clientId}`);

export const getSessionMessages = (sessionId: string) =>
    api.get<ChatMessage[]>(`/api/v1/sessions/${sessionId}/messages`);

export const createSession = (clientId: string, agentId: string) => {
    const externalId = generateExternalId();
    const sessionId = `${externalId}_${agentId}`;

    return api.post<ChatSession>(`/api/v1/sessions/`, {
        id: sessionId,
        client_id: clientId,
        agent_id: agentId,
    });
};

export const deleteSession = (sessionId: string) => {
    return api.delete<ChatSession>(`/api/v1/sessions/${sessionId}`);
};

export const sendMessage = (
    sessionId: string,
    agentId: string,
    message: string
) => {
    const externalId = sessionId.split("_")[0];

    return api.post<ChatMessage>(`/api/v1/chat`, {
        agent_id: agentId,
        external_id: externalId,
        message: message,
    });
};
