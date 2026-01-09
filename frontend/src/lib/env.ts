export const getApiUrl = (): string => {
    return import.meta.env.VITE_API_URL || '';
};

export const getWebSocketUrl = (): string => {
    // 1. Prioridade absoluta: Definição explícita no .env
    if (import.meta.env.VITE_WEBSOCKET_URL) {
        return import.meta.env.VITE_WEBSOCKET_URL;
    }

    const apiUrl = getApiUrl();

    // 2. Baseado na API URL se definida
    if (apiUrl) {
        let wsUrl = apiUrl.replace("http", "ws").replace("https", "wss");
        if (wsUrl.endsWith('/')) {
            wsUrl = wsUrl.slice(0, -1);
        }
        return wsUrl;
    }

    // 3. Fallback (Zero Config): Usa a URL da janela atual (suporta Proxy do Vite e acesso via IP)
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}`;
    }

    return '';
};
