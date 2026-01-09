/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /hooks/use-agent-webSocket.ts                                         │
│ Developed by: Davidson Gomes                                                 │
│ Creation date: May 13, 2025                                                  │
│ Contact: contato@evolution-api.com                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ @copyright © Evolution API 2025. All rights reserved.                        │
│ Licensed under the Apache License, Version 2.0                               │
│                                                                              │
│ You may not use this file except in compliance with the License.             │
│ You may obtain a copy of the License at                                      │
│                                                                              │
│    http://www.apache.org/licenses/LICENSE-2.0                                │
│                                                                              │
│ Unless required by applicable law or agreed to in writing, software          │
│ distributed under the License is distributed on an "AS IS" BASIS,            │
│ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.     │
│ See the License for the specific language governing permissions and          │
│ limitations under the License.                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ @important                                                                   │
│ For any future changes to the code in this file, it is recommended to        │
│ include, together with the modification, the information of the developer    │
│ who changed it and the date of modification.                                 │
│ └──────────────────────────────────────────────────────────────────────────────┘
*/
import { getWebSocketUrl } from "@/lib/env";
import { useEffect, useRef, useCallback } from "react";

interface FileData {
    filename: string;
    content_type: string;
    data: string;
}

interface UseAgentWebSocketProps {
    agentId: string;
    externalId: string;
    jwt?: string;
    apiKey?: string;
    onEvent: (event: any) => void;
    onTurnComplete?: () => void;
}

interface PendingMessageData {
    message: string;
    files?: FileData[];
}

export function useAgentWebSocket({
    agentId,
    externalId,
    jwt,
    apiKey,
    onEvent,
    onTurnComplete,
}: UseAgentWebSocketProps) {
    const wsRef = useRef<WebSocket | null>(null);
    const pendingMessageRef = useRef<PendingMessageData | null>(null);
    const onEventRef = useRef(onEvent);
    const onTurnCompleteRef = useRef(onTurnComplete);

    // Update refs when props change
    useEffect(() => {
        onEventRef.current = onEvent;
        onTurnCompleteRef.current = onTurnComplete;
    }, [onEvent, onTurnComplete]);

    const openWebSocket = useCallback(() => {
        if (!agentId || !externalId) {
            return;
        }

        const wsBaseUrl = getWebSocketUrl();
        const wsUrl = `${wsBaseUrl}/api/v1/chat/ws/${agentId}/${externalId}`;
        console.log(`[WebSocket] Connecting to: ${wsUrl}`);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("[WebSocket] Connected");
            if (apiKey) {
                ws.send(JSON.stringify({ type: "authorization", api_key: apiKey }));
            } else if (jwt) {
                ws.send(JSON.stringify({ type: "authorization", token: jwt }));
            }

            // Send pending messages
            if (pendingMessageRef.current) {
                const pending = pendingMessageRef.current;
                if (pending.files && pending.files.length > 0) {
                    ws.send(JSON.stringify({
                        message: pending.message,
                        files: pending.files
                    }));
                } else {
                    ws.send(JSON.stringify({ message: pending.message }));
                }
                pendingMessageRef.current = null;
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.message) {
                    let eventObj = data.message;
                    if (typeof data.message === "string" && data.message.trim() !== "") {
                        try {
                            eventObj = JSON.parse(data.message);
                        } catch (e) {
                            console.warn("[WebSocket] data.message is not valid JSON:", data.message);
                        }
                    }
                    if (onEventRef.current) onEventRef.current(eventObj);
                }
                if (data.turn_complete && onTurnCompleteRef.current) {
                    onTurnCompleteRef.current();
                }
            } catch (err) {
                console.error("[WebSocket] Error processing message:", err, event.data);
            }
        };

        ws.onerror = (err) => {
            console.error("[WebSocket] connection error:", err);
        };

        ws.onclose = (event) => {
            console.warn("[WebSocket] connection closed:", event);
        };
    }, [agentId, externalId, jwt, apiKey]);

    useEffect(() => {
        openWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [openWebSocket]);

    const sendMessage = useCallback((msg: string, files?: FileData[]) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            if (files && files.length > 0) {
                wsRef.current.send(JSON.stringify({ message: msg, files }));
            } else {
                wsRef.current.send(JSON.stringify({ message: msg }));
            }
        } else {
            console.warn("[WebSocket] unable to send message, connection not open.");
            pendingMessageRef.current = { message: msg, files };
            // If socket is closed/closing, try to reopen?
            // Usually openWebSocket is controlled by useEffect, but we can check readyState
            if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED || wsRef.current.readyState === WebSocket.CLOSING) {
                openWebSocket();
            }
        }
    }, [openWebSocket]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    return { sendMessage, disconnect };
}
