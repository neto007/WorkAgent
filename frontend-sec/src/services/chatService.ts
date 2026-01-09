import api from './api';
import type { ChatSession, SendMessageRequest, SendMessageResponse } from '@/types/chat';

// Get client_id from logged user
const getClientId = (): string => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return '';
    try {
        const user = JSON.parse(userStr);
        return user.client_id || '';
    } catch {
        return '';
    }
};

export const sendMessage = (data: SendMessageRequest) => {
    const clientId = getClientId();
    return api.post<SendMessageResponse>('/api/v1/chat/message', data, {
        headers: { 'x-client-id': clientId },
    });
};

export const getChatSessions = (agentId?: string) => {
    const clientId = getClientId();
    const params = agentId ? `?agent_id=${agentId}` : '';
    return api.get<ChatSession[]>(`/api/v1/chat/sessions${params}`, {
        headers: { 'x-client-id': clientId },
    });
};

export const getChatSession = (sessionId: string) => {
    const clientId = getClientId();
    return api.get<ChatSession>(`/api/v1/chat/sessions/${sessionId}`, {
        headers: { 'x-client-id': clientId },
    });
};

export const deleteChatSession = (sessionId: string) => {
    const clientId = getClientId();
    return api.delete(`/api/v1/chat/sessions/${sessionId}`, {
        headers: { 'x-client-id': clientId },
    });
};
