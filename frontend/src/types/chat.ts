export interface InlineData {
    type: string;
    data: string;
}

export interface AttachedFile {
    filename: string;
    content_type: string;
    data?: string;
    size?: number;
    preview_url?: string;
}

export interface ChatPart {
    text?: string;
    functionCall?: any;
    function_call?: any;
    functionResponse?: any;
    function_response?: any;
    inline_data?: {
        data: string;
        mime_type: string;
        metadata?: {
            filename?: string;
            [key: string]: any;
        };
        fileId?: string;
    };
    videoMetadata?: any;
    thought?: any;
    codeExecutionResult?: any;
    executableCode?: any;
    file_data?: {
        filename?: string;
        fileId?: string;
        [key: string]: any;
    };
}

export interface Message {
    id: string;
    content: {
        parts: ChatPart[];
        role: string;
        inlineData?: InlineData[];
        files?: AttachedFile[];
    } | string; // Supporting string for compatibility during migration, but ideally object
    role: 'user' | 'assistant' | 'system' | string;
    created_at: string;
    agent_id?: string;
    author?: string; // Compatibility alias for role
    timestamp?: number;
}

export interface ChatSession {
    id: string;
    app_name?: string;
    user_id?: string;
    state?: Record<string, any>;
    events?: any[];
    last_update_time?: number;
    update_time?: string;
    create_time?: string;
    created_at: string;
    agent_id: string;
    client_id?: string;
}

export interface SendMessageRequest {
    content: string;
    agent_id: string;
    session_id?: string;
}

export interface SendMessageResponse {
    message: Message;
    session_id: string;
}
