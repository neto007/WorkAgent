/*
* @author: Davidson Gomes
* @file: /pages/ChatPage.tsx
*/
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    MessageSquare,
    Plus,
    Search,
    Loader2,
    X,
    Trash2,
    Bot,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogDescription,
} from '@/components/ui/dialog';
import { listAgents } from '@/services/agentService';
import {
    listSessions,
    getSessionMessages,
    deleteSession,
} from '@/services/sessionService';
import { type Message, type ChatSession, type ChatPart } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentWebSocket } from '@/hooks/use-agent-webSocket';
import { ChatMessage as ChatMessageComponent } from '@/components/chat/ChatMessage';
import { SessionList } from '@/components/chat/SessionList';
import { ChatInput } from '@/components/chat/ChatInput';
import { type FileData } from '@/lib/file-utils';
import { AgentInfoDialog } from '@/components/chat/AgentInfoDialog';
import { ConfirmationDialog } from '@/components/agents/dialogs/ConfirmationDialog';
import { useClient } from '@/contexts/ClientContext';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentMessageGrouper } from '@/lib/agentMessageGrouper';
import type { GroupedAgentMessage } from '@/components/chat/AgentExecutionView';

interface FunctionMessageContent {
    title: string;
    content: string;
    author?: string;
}

const ChatPage: React.FC = () => {
    const { agentId: routeAgentId } = useParams<{ agentId?: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { clientId } = useClient();

    const [isLoading, setIsLoading] = useState(true);
    const [agents, setAgents] = useState<any[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [messages, setMessages] = useState<(Message | GroupedAgentMessage)[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [agentSearchTerm, setAgentSearchTerm] = useState("");
    const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
    const [showAgentFilter, setShowAgentFilter] = useState(false);
    const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>({});
    const [isAgentInfoDialogOpen, setIsAgentInfoDialogOpen] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const messageGrouperRef = useRef(new AgentMessageGrouper());

    // Initial agent selection from route
    useEffect(() => {
        if (routeAgentId) {
            setCurrentAgentId(routeAgentId);
            setIsNewChatDialogOpen(false);
        }
    }, [routeAgentId]);

    const scrollToBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (!clientId) return;
            setIsLoading(true);
            try {
                const agentsResponse = await listAgents(clientId);
                setAgents(agentsResponse.data);

                const sessionsResponse = await listSessions(clientId);
                setSessions(sessionsResponse.data);
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Failed to load sessions");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [clientId]);

    useEffect(() => {
        if (!selectedSession) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            try {
                setIsLoading(true);
                const response = await getSessionMessages(selectedSession);

                // Agrupar mensagens históricas que contêm steps
                const { groupHistoricalMessages } = await import('@/lib/groupHistoricalMessages');
                const groupedMessages = groupHistoricalMessages(response.data);

                setMessages(groupedMessages);

                const agentId = selectedSession.split("_")[1];
                setCurrentAgentId(agentId);

                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error("Error loading messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();
    }, [selectedSession]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(scrollToBottom, 100);
        }
    }, [messages]);

    const filteredAgents = useMemo(() => {
        return agents.filter(
            (agent) =>
                agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase()) ||
                (agent.description &&
                    agent.description.toLowerCase().includes(agentSearchTerm.toLowerCase()))
        );
    }, [agents, agentSearchTerm]);

    const selectAgent = (agentId: string) => {
        setCurrentAgentId(agentId);
        setSelectedSession(null);
        setMessages([]);
        setIsNewChatDialogOpen(false);
        // Optional: Update URL to reflect selected agent
        navigate(`/chat/${agentId}`, { replace: true });
    };

    const handleSendMessageWithFiles = useCallback((message: string, files?: FileData[]) => {
        if ((!message.trim() && (!files || files.length === 0)) || !currentAgentId)
            return;

        setIsSending(true);

        const messageParts: ChatPart[] = [];

        if (message.trim()) {
            messageParts.push({ text: message });
        }

        if (files && files.length > 0) {
            files.forEach(file => {
                messageParts.push({
                    inline_data: {
                        data: file.data,
                        mime_type: file.content_type,
                        metadata: {
                            filename: file.filename
                        }
                    }
                });
            });
        }

        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            content: {
                parts: messageParts, // Correct structure for Message content object
                role: "user"
            },
            role: "user",
            author: "user",
            created_at: new Date().toISOString(),
            timestamp: Date.now() / 1000,
        };

        setMessages((prev) => [...prev, tempMessage]);

        wsSendMessage(message, files);
    }, [currentAgentId]); // wsSendMessage is stable from useAgentWebSocket hook

    const generateExternalId = () => {
        const now = new Date();
        return (
            now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, "0") +
            now.getDate().toString().padStart(2, "0") +
            now.getHours().toString().padStart(2, "0") +
            now.getMinutes().toString().padStart(2, "0") +
            now.getSeconds().toString().padStart(2, "0") +
            now.getMilliseconds().toString().padStart(3, "0")
        );
    };

    const currentAgent = agents.find((agent) => agent.id === currentAgentId);

    const getCurrentSessionInfo = () => {
        if (!selectedSession) return null;

        const parts = selectedSession.split("_");

        try {
            const dateStr = parts[0];
            if (dateStr.length >= 8) {
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);

                return {
                    externalId: parts[0],
                    agentId: parts[1],
                    displayDate: `${day}/${month}/${year}`,
                };
            }
        } catch (e) {
            console.error("Error processing session ID:", e);
        }

        return {
            externalId: parts[0],
            agentId: parts[1],
            displayDate: "Session",
        };
    };

    const getExternalId = (sessionId: string) => {
        return sessionId.split("_")[0];
    };

    const containsMarkdown = (text: string): boolean => {
        if (!text || text.length < 3) return false;

        const markdownPatterns = [
            /[*_]{1,2}[^*_]+[*_]{1,2}/,
            /\[[^\]]+\]\([^)]+\)/,
            /^#{1,6}\s/m,
            /^[-*+]\s/m,
            /^[0-9]+\.\s/m,
            /^>\s/m,
            /`[^`]+`/,
            /```[\s\S]*?```/,
            /^\|(.+\|)+$/m,
            /!\[[^\]]*\]\([^)]+\)/,
        ];

        return markdownPatterns.some((pattern) => pattern.test(text));
    };

    const getMessageText = (message: Message | GroupedAgentMessage): string => {
        // GroupedAgentMessage não tem content, retornar string vazia
        if ('executionSteps' in message) {
            return '';
        }

        // Mensagem regular
        if (typeof message.content === 'string') {
            return message.content;
        }

        if (message.content && typeof message.content === 'object' && 'parts' in message.content) {
            const textPart = message.content.parts?.find((part: ChatPart) => part.text);
            return textPart?.text || '';
        }

        return '';
    };

    const getMessageContentForDisplay = (message: Message): string | FunctionMessageContent => {
        const author = message.author || message.role || 'unknown';

        if (typeof message.content === 'string') {
            return message.content;
        }

        const parts = message.content.parts;

        if (!parts || parts.length === 0) return "Empty content";

        const functionCallPart = parts.find(
            (part: ChatPart) => part.functionCall || part.function_call
        );
        const functionResponsePart = parts.find(
            (part: ChatPart) => part.functionResponse || part.function_response
        );

        if (functionCallPart) {
            const funcCall =
                functionCallPart.functionCall || functionCallPart.function_call || {};
            const args = funcCall.args || {};
            const name = funcCall.name || "unknown";
            const id = funcCall.id || "no-id";

            return {
                author,
                title: `📞 Function call: ${name}`,
                content: `ID: ${id}\nArgs: ${Object.keys(args).length > 0
                    ? `\n${JSON.stringify(args, null, 2)}`
                    : "{}"
                    }`,
            } as FunctionMessageContent;
        }

        if (functionResponsePart) {
            const funcResponse =
                functionResponsePart.functionResponse ||
                functionResponsePart.function_response ||
                {};
            const response = funcResponse.response || {};
            const name = funcResponse.name || "unknown";
            const id = funcResponse.id || "no-id";
            const status = response.status || "unknown";
            const statusEmoji = status === "error" ? "❌" : "✅";

            let resultText = "";
            if (status === "error") {
                resultText = `Error: ${response.error_message || "Unknown error"}`;
            } else if (response.report) {
                resultText = `Result: ${response.report}`;
            } else if (response.result && response.result.content) {
                resultText = `Result:\n${JSON.stringify(response.result.content, null, 2)}`;
            } else {
                resultText = `Result:\n${JSON.stringify(response, null, 2)}`;
            }

            return {
                author,
                title: `${statusEmoji} Function response: ${name}`,
                content: `ID: ${id}\n${resultText}`,
            } as FunctionMessageContent;
        }

        if (parts.length === 1 && parts[0].text) {
            return parts[0].text || "";
        }

        const textParts = parts
            .filter((part: ChatPart) => part.text)
            .map((part: ChatPart) => part.text)
            .filter((text: string | undefined) => text);

        if (textParts.length > 0) {
            return textParts.join("\n\n");
        }

        return "Empty content";
    };

    const toggleFunctionExpansion = (messageId: string) => {
        setExpandedFunctions((prev) => ({
            ...prev,
            [messageId]: !prev[messageId],
        }));
    };

    const agentColors: Record<string, string> = {
        Assistant: "bg-[#bd93f9]",
        Programmer: "bg-[#50fa7b]",
        Writer: "bg-[#8be9fd]",
        Researcher: "bg-[#ffb86c]",
        Planner: "bg-[#ff79c6]",
        default: "bg-[#44475a]",
    };

    const getAgentColor = (agentName: string) => {
        return agentColors[agentName] || agentColors.default;
    };

    const handleDeleteSession = async () => {
        if (!selectedSession) return;

        try {
            await deleteSession(selectedSession);

            setSessions(sessions.filter((session) => session.id !== selectedSession));
            setSelectedSession(null);
            setMessages([]);
            setCurrentAgentId(null);
            setIsDeleteDialogOpen(false);

            toast.success("Session deleted successfully");
        } catch (error) {
            console.error("Error deleting session:", error);
            toast.error("Error deleting session");
        }
    };

    const onEvent = useCallback((event: any) => {
        console.log('[ChatPage] Received event:', event);

        setMessages((prev) => {
            // Verificar se temos o formato estruturado novo (A2A Rich Payload)
            let structuredContent = null;

            if (typeof event.content === 'object' && event.content !== null && 'step' in event.content) {
                structuredContent = event.content;
            } else if (typeof event.content === 'string' && event.content.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(event.content);
                    if (parsed && typeof parsed === 'object' && 'step' in parsed) {
                        structuredContent = parsed;
                    }
                } catch (e) {
                    // Não é um JSON válido, continuar como string normal
                }
            }

            // Fallback para conteúdo string antigo
            const stringContent = typeof event.content === 'string'
                ? event.content
                : event.content?.parts?.find((p: any) => p.text)?.text || '';

            // TENTATIVA CRÍTICA: Se não achou estruturado, tentar parsear stringContent
            // Isso resolve o caso onde o payload A2A vem dentro de parts[0].text
            if (!structuredContent && stringContent && stringContent.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(stringContent);
                    if (parsed && typeof parsed === 'object' && 'step' in parsed) {
                        structuredContent = parsed;
                        console.log('[ChatPage] Successfully parsed JSON from stringContent!');
                    }
                } catch (e) {
                    // Não é JSON válido, segue vida
                }
            }

            console.log('[ChatPage] Content Analysis:', {
                isStructured: !!structuredContent,
                contentType: typeof event.content,
                contentPreview: typeof event.content === 'string' ? event.content.substring(0, 50) : 'Object'
            });

            // NOVO: Detectar eventos de tool_result (erros de ferramentas)
            // Esses eventos vêm quando uma ferramenta falha e precisam ser adicionados ao último step
            if (event.role === 'user' && event.content?.tool_result) {
                const toolResult = event.content.tool_result;
                console.log('[ChatPage] Detected tool_result event:', toolResult);

                // Adicionar resultado ao último step da última execução
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && 'executionSteps' in lastMessage) {
                    const execution = lastMessage as GroupedAgentMessage;
                    const lastStepIndex = execution.executionSteps.length - 1;

                    if (lastStepIndex >= 0) {
                        const newSteps = [...execution.executionSteps];
                        const lastStep = { ...newSteps[lastStepIndex] };

                        // Adicionar ou atualizar toolResults
                        if (!lastStep.toolResults) {
                            lastStep.toolResults = [];
                        } else {
                            lastStep.toolResults = [...lastStep.toolResults];
                        }
                        lastStep.toolResults.push(toolResult);

                        // Marcar como ERROR se success === false
                        if (toolResult.success === false) {
                            lastStep.phase = 'ERROR';
                            lastStep.endTime = Date.now() / 1000;
                        }

                        newSteps[lastStepIndex] = lastStep;

                        const updatedExecution = {
                            ...execution,
                            executionSteps: newSteps
                        };

                        return [...prev.slice(0, -1), updatedExecution];
                    }
                }
                // Se não encontrou execução, apenas retornar prev
                return prev;
            }

            // Ignorar mensagens do usuário normais
            if (event.role === 'user' || event.author === 'user') {
                return [...prev, event];
            }

            // Variáveis normalizadas
            let stepNumber: number | null = null;
            let phase: string | null = null;
            let isStepMessage = false;

            // 1. Tentar extrair do formato estruturado
            if (structuredContent) {
                stepNumber = structuredContent.step;
                phase = structuredContent.state?.toUpperCase(); // thinking, calling_tool, etc
                isStepMessage = true;

                console.log('[ChatPage] A2A Structured Step Detected:', stepNumber, phase);
            }
            // 2. Fallback: Tentar extrair via Regex do formato string
            else {
                // Regex ultra-flexível
                const stepMatch = stringContent.match(/🔄\s*\*?\*?Step\s+(\d+)(?:.*?)?:\s+(\w+)/i);
                if (stepMatch) {
                    stepNumber = parseInt(stepMatch[1]);
                    phase = stepMatch[2].toUpperCase();
                    isStepMessage = true;
                }
            }

            if (isStepMessage && stepNumber !== null && phase) {
                console.log('[ChatPage] Detected step:', stepNumber, phase);

                const lastMessage = prev[prev.length - 1];
                const isGrouped = lastMessage && 'executionSteps' in lastMessage;
                const hasFinalOutput = isGrouped && (lastMessage as GroupedAgentMessage).finalOutput && (lastMessage as GroupedAgentMessage).finalOutput.trim().length > 0;

                const shouldCreateNew = stepNumber === 1 || !isGrouped || hasFinalOutput;

                if (shouldCreateNew) {
                    // Criar nova execução
                    console.log('[ChatPage] Creating new execution (Step 1 or previous completed)');

                    // Extrair dados iniciais do step (IMPORTANTE: fazer isso ANTES de criar o step)
                    let stepContent = '';
                    let toolsCalled: string[] | undefined;
                    let toolResults: any[] | undefined;

                    if (structuredContent) {
                        stepContent = structuredContent.thinking || '';
                        if (structuredContent.tools) {
                            toolsCalled = structuredContent.tools.map((t: any) => t.name);
                        }
                        if (structuredContent.results) {
                            toolResults = structuredContent.results;
                        }
                    } else {
                        // Fallback: Regex (extrair mesmo se vier como COMPLETED)
                        const content = stringContent;

                        const thinkingMatch = content.match(/💭\s*\*?Thinking\*?:\s*(.+?)(?=\n\n|🛠️|📤|🔄|$)/s) ||
                            content.match(/\*?Thinking\*?:\s*(.+?)(?=\n\n|Tools|Tool Results|🔄|$)/si);
                        if (thinkingMatch) {
                            stepContent = thinkingMatch[1].trim();
                        }

                        const toolsMatch = content.match(/🛠️\s*\*?Tools Called\*?:\s*•\s*(.+?)(?=\n|$)/);
                        if (toolsMatch) {
                            toolsCalled = toolsMatch[1].split('•').map((t: any) => t.trim()).filter(Boolean);
                        }

                        const resultsMatch = content.match(/📤\s*\*?Tool Results\*?:\s*\n([\s\S]+?)(?=🔄|$)/);
                        if (resultsMatch) {
                            toolResults = [resultsMatch[1].trim()];
                        }
                    }

                    const newExecution: GroupedAgentMessage = {
                        id: `exec-${Date.now()}`,
                        role: 'assistant',
                        executionSteps: [{
                            id: `step-${stepNumber}-${Date.now()}`,
                            stepNumber: stepNumber!,
                            phase: phase as any,
                            title: `Step ${stepNumber}`,
                            content: stepContent,
                            toolsCalled,
                            toolResults,
                            startTime: event.timestamp || Date.now() / 1000,
                            endTime: (phase === 'COMPLETED' || phase === 'ERROR') ? (event.timestamp || Date.now() / 1000) : undefined,
                        }],
                        finalOutput: '',
                        created_at: event.created_at || new Date().toISOString(),
                        avatarUrl: (event as any).avatarUrl,
                    };

                    return [...prev, newExecution];
                } else {
                    // Atualizar execução existente de forma imutável
                    const execution = lastMessage as GroupedAgentMessage;

                    // 1. Identificar se o step existe ou criar um novo array de steps
                    const existingStepIndex = execution.executionSteps.findIndex(s => s.stepNumber === stepNumber);

                    let newSteps = [...execution.executionSteps];
                    let currentStep: any; // Usando any para facilitar manipulação dos campos opcionais

                    if (existingStepIndex === -1) {
                        // Novo step
                        currentStep = {
                            id: `step-${stepNumber}-${Date.now()}`,
                            stepNumber: stepNumber!,
                            phase: phase as any,
                            title: `Step ${stepNumber}`,
                            content: '',
                            startTime: event.timestamp || Date.now() / 1000,
                        };
                        newSteps.push(currentStep);
                    } else {
                        // Atualizar step existente (Shallow Copy do objeto step)
                        currentStep = { ...newSteps[existingStepIndex] };
                        currentStep.phase = phase as any;
                        // Substituir no array
                        newSteps[existingStepIndex] = currentStep;
                    }

                    // Extrair dados (Híbrido: Estruturado ou Regex)
                    if (structuredContent) {
                        // 1. Usar dados estruturados A2A Rich Payload
                        if (structuredContent.thinking) {
                            currentStep.content = structuredContent.thinking;
                        }
                        if (structuredContent.tools) {
                            currentStep.toolsCalled = structuredContent.tools.map((t: any) => t.name);
                        }
                        if (structuredContent.results) {
                            currentStep.toolResults = structuredContent.results;
                        }
                    } else {
                        // 2. Fallback: Regex em stringContent
                        const content = stringContent;

                        // Extrair thinking (MUITO flexível) - só sobrescrever se não estiver vazio
                        let thinkingMatch = content.match(/💭\s*\*?Thinking\*?:\s*(.+?)(?=\n\n|🛠️|📤|🔄|$)/s);
                        if (!thinkingMatch) {
                            thinkingMatch = content.match(/\*?Thinking\*?:\s*(.+?)(?=\n\n|Tools|Tool Results|🔄|$)/si);
                        }
                        if (thinkingMatch && thinkingMatch[1].trim()) {
                            currentStep.content = thinkingMatch[1].trim();
                        }

                        // Extrair tools (aceita markdown) - só se ainda não tiver
                        if (!currentStep.toolsCalled || currentStep.toolsCalled.length === 0) {
                            const toolsMatch = content.match(/🛠️\s*\*?Tools Called\*?:\s*•\s*(.+?)(?=\n|$)/);
                            if (toolsMatch) {
                                currentStep.toolsCalled = toolsMatch[1].split('•').map((t: any) => t.trim()).filter(Boolean);
                            }
                        }

                        // Extrair results (aceita markdown) - só se ainda não tiver
                        if (!currentStep.toolResults || currentStep.toolResults.length === 0) {
                            const resultsMatch = content.match(/📤\s*\*?Tool Results\*?:\s*\n([\s\S]+?)(?=🔄|$)/);
                            if (resultsMatch) {
                                currentStep.toolResults = [resultsMatch[1].trim()];
                            }
                        }
                    }

                    // Se mudou para COMPLETED ou ERROR, definir endTime
                    if (currentStep.phase === 'COMPLETED' || currentStep.phase === 'ERROR') {
                        currentStep.endTime = event.timestamp || Date.now() / 1000;
                    }

                    const updatedExecution = {
                        ...execution,
                        executionSteps: newSteps
                    };

                    // Substituir última mensagem com a nova referência atualizada
                    return [...prev.slice(0, -1), updatedExecution];
                }
            } else {
                // Não é um step - pode ser mensagem final ou regular
                const lastMessage = prev[prev.length - 1];
                const isGrouped = lastMessage && 'executionSteps' in lastMessage;

                if (isGrouped && !stringContent.startsWith('🔄')) {
                    // É a mensagem final de uma execução
                    console.log('[ChatPage] Detected final message');
                    const execution = lastMessage as GroupedAgentMessage;
                    const finalized = {
                        ...execution,
                        finalOutput: stringContent.trim(),
                    };

                    return [...prev.slice(0, -1), finalized];
                } else {
                    // Mensagem regular
                    console.log('[ChatPage] Regular message');
                    const existingIndex = prev.findIndex(msg => msg.id === event.id);

                    if (existingIndex >= 0) {
                        const updated = [...prev];
                        updated[existingIndex] = event;
                        return updated;
                    } else {
                        return [...prev, event];
                    }
                }
            }
        });
    }, []);

    const onTurnComplete = useCallback(() => {
        setIsSending(false);
        if (clientId) {
            listSessions(clientId).then(res => setSessions(res.data)).catch(console.error);
        }
    }, [clientId]);

    const handleAgentInfoClick = () => {
        setIsAgentInfoDialogOpen(true);
    };

    // WebSocket Hook
    const agentId = useMemo(() => currentAgentId || "", [currentAgentId]);
    const externalId = useMemo(
        () =>
            selectedSession ? getExternalId(selectedSession) : generateExternalId(),
        [selectedSession]
    );

    // Grab token from cookie for auth, similar to original frontend logic
    const jwt = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1] || "";

    const { sendMessage: wsSendMessage, disconnect: _ } = useAgentWebSocket({
        agentId,
        externalId,
        jwt,
        onEvent,
        onTurnComplete,
    });

    return (
        <div className="flex h-full bg-[#050101] overflow-hidden">
            <SessionList
                sessions={sessions}
                agents={agents}
                selectedSession={selectedSession}
                isLoading={isLoading}
                searchTerm={searchTerm}
                selectedAgentFilter={selectedAgentFilter}
                showAgentFilter={showAgentFilter}
                setSearchTerm={setSearchTerm}
                setSelectedAgentFilter={setSelectedAgentFilter}
                setShowAgentFilter={setShowAgentFilter}
                setSelectedSession={setSelectedSession}
                setIsNewChatDialogOpen={setIsNewChatDialogOpen}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                {selectedSession || currentAgentId ? (
                    <>
                        <div className="p-4 border-b border-[#1a1b26] bg-[#050101]/80 backdrop-blur flex justify-between items-center z-10 shadow-sm">
                            {(() => {
                                const sessionInfo = getCurrentSessionInfo();

                                return (
                                    <>
                                        <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
                                            <div className="p-2 rounded-xl bg-[#bd93f9]/20 border border-[#bd93f9]/50 shadow-[0_0_10px_rgba(189,147,249,0.3)]">
                                                <MessageSquare className="h-5 w-5 text-[#bd93f9]" />
                                            </div>
                                            {selectedSession
                                                ? `Session ${sessionInfo?.externalId || selectedSession}`
                                                : "New Conversation"}
                                        </h2>

                                        <div className="flex items-center gap-3">
                                            {currentAgent && (
                                                <Badge
                                                    className="bg-[#50fa7b] text-[#282a36] px-3 py-1 text-xs font-bold uppercase border-b-2 border-[#2aa34a] hover:translate-y-px hover:border-b-0 transition-all cursor-pointer"
                                                    onClick={handleAgentInfoClick}
                                                >
                                                    {currentAgent.name || currentAgentId}
                                                </Badge>
                                            )}

                                            {selectedSession && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-[#6272a4] hover:text-[#ff5555] hover:bg-[#ff5555]/10 rounded-xl transition-all"
                                                    onClick={() => setIsDeleteDialogOpen(true)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-6 bg-[#050101] scroll-smooth custom-scrollbar"
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="w-16 h-16 rounded-full bg-[#bd93f9]/10 flex items-center justify-center shadow-[0_0_20px_rgba(189,147,249,0.2)] mb-4 animate-pulse border border-[#bd93f9]/30">
                                        <Loader2 className="h-8 w-8 text-[#bd93f9] animate-spin" />
                                    </div>
                                    <p className="text-[#6272a4] font-bold uppercase tracking-widest text-xs animate-pulse">Loading conversation...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col h-full items-center justify-center text-center p-8">
                                    <div className="w-20 h-20 rounded-2xl bg-[#bd93f9] flex items-center justify-center shadow-[5px_5px_0px_#44475a] mb-8 border-2 border-white transform hover:-translate-y-1 transition-transform">
                                        <MessageSquare className="h-10 w-10 text-[#282a36]" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">
                                        {currentAgent ? `Chat with ${currentAgent.name}` : "New Conversation"}
                                    </h3>
                                    <p className="text-[#6272a4] font-medium max-w-md">
                                        Type your message below to start the conversation. This chat will help you interact with the agent and explore its capabilities.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6 w-full max-w-4xl mx-auto pb-4">
                                    {messages.map((message) => {
                                        // Skip GroupedAgentMessage - handled by ChatMessageComponent
                                        const isGrouped = 'executionSteps' in message;

                                        if (isGrouped) {
                                            // GroupedAgentMessage - renderizado por ChatMessageComponent
                                            const agentColor = getAgentColor('assistant');
                                            return (
                                                <ChatMessageComponent
                                                    key={message.id}
                                                    message={message as Message}
                                                    agentColor={agentColor}
                                                    isExpanded={false}
                                                    toggleExpansion={() => { }}
                                                    containsMarkdown={() => false}
                                                    messageContent=""
                                                    sessionId={selectedSession || undefined}
                                                />
                                            );
                                        }

                                        // Mensagem regular
                                        const messageContent = getMessageContentForDisplay(message as Message);
                                        const agentColor = getAgentColor(message.author || 'default');
                                        const isExpanded = expandedFunctions[message.id] || false;

                                        return (
                                            <ChatMessageComponent
                                                key={message.id}
                                                message={message}
                                                agentColor={agentColor}
                                                isExpanded={isExpanded}
                                                toggleExpansion={toggleFunctionExpansion}
                                                containsMarkdown={containsMarkdown}
                                                messageContent={messageContent}
                                                sessionId={selectedSession as string}
                                                avatarUrl={message.author === "user" ? undefined : currentAgent?.avatar_url}
                                            />
                                        );
                                    })}

                                    {isSending && (
                                        <div className="flex justify-start animate-fade-in-up">
                                            <div className="flex gap-4 max-w-[80%]">
                                                {currentAgent?.avatar_url ? (
                                                    <img
                                                        src={currentAgent.avatar_url}
                                                        alt={currentAgent.name}
                                                        className="h-18 w-18 object-contain flex-shrink-0"
                                                    />
                                                ) : (
                                                    <Avatar className="bg-[#bd93f9] border-2 border-[#1a1b26] shadow-[0_0_10px_rgba(189,147,249,0.4)] h-18 w-18">
                                                        <AvatarFallback className="bg-transparent text-[#282a36]">
                                                            <Bot className="h-9 w-9" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="rounded-2xl rounded-tl-none p-4 bg-[#1a1b26] border border-[#bd93f9]/30 shadow-lg">
                                                    <div className="flex space-x-2">
                                                        <div className="h-2 w-2 rounded-full bg-[#bd93f9] animate-bounce"></div>
                                                        <div className="h-2 w-2 rounded-full bg-[#bd93f9] animate-bounce [animation-delay:0.2s]"></div>
                                                        <div className="h-2 w-2 rounded-full bg-[#bd93f9] animate-bounce [animation-delay:0.4s]"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[#1a1b26] bg-[#0b0b11] p-3">
                            <div className="max-w-4xl mx-auto">
                                <ChatInput
                                    onSendMessage={handleSendMessageWithFiles}
                                    isLoading={isSending}
                                    placeholder="Type your message..."
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center bg-grid-white/[0.02]">
                        <div className="w-24 h-24 rounded-3xl bg-[#1a1b26] flex items-center justify-center shadow-[8px_8px_0px_#bd93f9] mb-8 border-2 border-[#bd93f9] transform hover:scale-105 transition-all">
                            <MessageSquare className="h-12 w-12 text-[#bd93f9]" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-widest">
                            Select a conversation
                        </h2>
                        <p className="text-[#6272a4] font-medium mb-10 max-w-md">
                            Choose an existing conversation from the sidebar or start a new one to begin.
                        </p>
                        <Button
                            onClick={() => setIsNewChatDialogOpen(true)}
                            className="bg-[#50fa7b] hover:bg-[#50fa7b] text-[#282a36] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all h-14 px-8 rounded-xl text-lg shadow-[0_0_20px_rgba(80,250,123,0.3)] hover:shadow-[0_0_30px_rgba(80,250,123,0.5)]"
                        >
                            <Plus className="mr-3 h-6 w-6 stroke-[3]" />
                            New Conversation
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
                <DialogContent className="bg-[#050101] border-[#1a1b26] border-2 shadow-[0_0_30px_rgba(189,147,249,0.15)] sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#bd93f9]">
                                <MessageSquare className="h-5 w-5 text-[#282a36]" />
                            </div>
                            New Conversation
                        </DialogTitle>
                        <DialogDescription className="text-[#6272a4] font-medium">
                            Select an agent to start a new conversation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6272a4]" />
                            <Input
                                placeholder="Search agents..."
                                className="pl-10 bg-[#1a1b26] border-[#343746] text-[#f8f8f2] focus-visible:ring-[#bd93f9] rounded-xl h-11"
                                value={agentSearchTerm}
                                onChange={(e) => setAgentSearchTerm(e.target.value)}
                            />
                            {agentSearchTerm && (
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6272a4] hover:text-[#ff5555] transition-colors"
                                    onClick={() => setAgentSearchTerm("")}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="text-[10px] font-bold text-[#6272a4] uppercase tracking-widest mb-2">Available Agents</div>

                        <ScrollArea className="h-[300px] pr-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <Loader2 className="h-8 w-8 text-[#bd93f9] animate-spin mb-2" />
                                    <p className="text-[#6272a4] text-xs font-bold uppercase">Loading...</p>
                                </div>
                            ) : filteredAgents.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredAgents.map((agent) => (
                                        <div
                                            key={agent.id}
                                            className="p-3 rounded-xl cursor-pointer transition-all bg-[#0b0b11] border border-[#1a1b26] hover:border-[#bd93f9] hover:bg-[#1a1b26] group flex items-center gap-3"
                                            onClick={() => selectAgent(agent.id)}
                                        >
                                            <div className="p-2 rounded-lg bg-[#bd93f9]/20 group-hover:bg-[#bd93f9] transition-colors">
                                                <Bot size={16} className="text-[#bd93f9] group-hover:text-[#282a36]" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#f8f8f2] group-hover:text-white transition-colors">
                                                    {agent.name}
                                                </div>
                                                <div className="text-xs text-[#6272a4] line-clamp-1">
                                                    {agent.description || "No description"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-[#6272a4] font-medium">
                                    No agents found.
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {currentAgent && (
                <AgentInfoDialog
                    open={isAgentInfoDialogOpen}
                    onOpenChange={setIsAgentInfoDialogOpen}
                    agent={currentAgent}
                />
            )}

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Session"
                description="Are you sure you want to delete this conversation? This action cannot be undone."
                onConfirm={handleDeleteSession}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default ChatPage;
