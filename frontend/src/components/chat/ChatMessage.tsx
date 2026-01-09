import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getApiUrl } from "@/lib/env";
import type { Message, ChatPart } from "@/types/chat";
import { ChevronDown, ChevronRight, Copy, Check, User, Bot, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, memo } from "react";
import { InlineDataAttachments } from "./InlineDataAttachments";
import { AgentExecutionView, type GroupedAgentMessage } from "./AgentExecutionView";
import { JsonViewer, isValidJSON, parseEscapedJSON } from "./JsonViewer";

interface FunctionMessageContent {
    title: string;
    content: string;
    author?: string;
}

interface ChatMessageProps {
    message: Message;
    agentColor?: string;
    isExpanded: boolean;
    toggleExpansion: (messageId: string) => void;
    containsMarkdown: (text: string) => boolean;
    messageContent: string | FunctionMessageContent;
    sessionId?: string;
    avatarUrl?: string;
}

const ChatMessageComponent = ({
    message,
    // agentColor, // Unused for now, leveraging new palette
    isExpanded,
    toggleExpansion,
    containsMarkdown,
    messageContent,
    sessionId,
    avatarUrl,
}: ChatMessageProps) => {
    const [isCopied, setIsCopied] = useState(false);

    // Check if this is a grouped agent execution message
    const isAgentExecution = (msg: Message): msg is GroupedAgentMessage => {
        const result = 'executionSteps' in msg && 'finalOutput' in msg;
        console.log('[ChatMessage] Message type check:', {
            hasExecutionSteps: 'executionSteps' in msg,
            hasFinalOutput: 'finalOutput' in msg,
            isAgentExecution: result,
            messageId: msg.id,
            messageKeys: Object.keys(msg)
        });
        return result;
    };

    // If it's an agent execution, render with AgentExecutionView
    if (isAgentExecution(message)) {
        console.log('[ChatMessage] Rendering as AgentExecutionView:', message);
        return (
            <AgentExecutionView
                execution={message}
                containsMarkdown={containsMarkdown}
            />
        );
    }

    console.log('[ChatMessage] Rendering as regular message:', message);

    // Determine roles and flags based on flexible 'role' or 'author' property
    const role = message.role || message.author || 'system';
    const isUser = role === "user";

    // Checking parts safely
    const parts = typeof message.content === 'object' && 'parts' in message.content
        ? message.content.parts
        : [];

    const hasFunctionCall = parts.some(
        (part: ChatPart) => part.functionCall || part.function_call
    );
    const hasFunctionResponse = parts.some(
        (part: ChatPart) => part.functionResponse || part.function_response
    );

    const isFunctionMessage = hasFunctionCall || hasFunctionResponse;

    const isTaskExecutor = typeof messageContent === "object" &&
        "author" in messageContent &&
        typeof messageContent.author === "string" &&
        messageContent.author?.endsWith("- Task executor");

    const inlineDataParts = parts.filter(part => part.inline_data);
    const hasInlineData = inlineDataParts.length > 0;

    const copyToClipboard = () => {
        const textToCopy = typeof messageContent === "string"
            ? messageContent
            : messageContent.content;

        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    // Generate appropriate avatar content
    const getAvatar = () => {
        if (isUser) {
            return (
                <Avatar className="bg-[#50fa7b] border-2 border-[#1a1b26] shadow-neu h-10 w-10">
                    <AvatarFallback className="bg-transparent">
                        <User className="h-6 w-6 text-[#050101]" />
                    </AvatarFallback>
                </Avatar>
            );
        } else if (avatarUrl) {
            let fullAvatarUrl = avatarUrl;
            // If the URL is relative (starts with /), prepend the API URL
            if (avatarUrl.startsWith('/')) {
                const baseUrl = getApiUrl();
                // Se baseUrl for vazia, assume que o proxy do vite lidará com urls relativas
                // ou que a imagem está no mesmo host
                if (baseUrl) {
                    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                    fullAvatarUrl = `${cleanBase}${avatarUrl}`;
                } else {
                    fullAvatarUrl = avatarUrl;
                }
            }

            return (
                <img
                    src={fullAvatarUrl}
                    alt="Agent Avatar"
                    className="h-18 w-18 object-contain flex-shrink-0"
                    onError={(e) => {
                        // Fallback to icon with border if image fails
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                    }}
                />
            );
        } else {
            return (
                <Avatar className={`shadow-neu border-2 h-10 w-10 ${isFunctionMessage
                    ? "border-[#ffb86c] bg-[#0b0b11]"
                    : "border-[#bd93f9] bg-[#0b0b11]"
                    }`}>
                    <AvatarFallback className="bg-transparent">
                        {isFunctionMessage ?
                            <Terminal className="h-5 w-5 text-[#ffb86c]" /> :
                            <Bot className="h-6 w-6 text-[#bd93f9]" />
                        }
                    </AvatarFallback>
                </Avatar>
            );
        }
    };

    return (
        <div
            key={message.id}
            className="flex w-full mb-6"
            style={{
                justifyContent: isUser ? "flex-end" : "flex-start"
            }}
        >
            <div
                className="flex gap-4 max-w-[90%]"
                style={{
                    flexDirection: isUser ? "row-reverse" : "row"
                }}
            >
                {getAvatar()}
                <div
                    className={`rounded-2xl p-4 overflow-hidden relative group shadow-neu-sm border-2 ${isFunctionMessage || isTaskExecutor
                        ? "bg-[#0b0b11] border-[#ffb86c]/50 text-[#ffb86c] font-mono text-sm"
                        : isUser
                            ? "bg-[#50fa7b] text-[#050101] border-[#50fa7b] font-medium"
                            : "bg-[#0b0b11] border-[#bd93f9]/50 text-[#f8f8f2]"
                        }`}
                    style={{
                        wordBreak: "break-word",
                        maxWidth: "calc(100% - 3.5rem)",
                        width: "fit-content"
                    }}
                >
                    {isFunctionMessage || isTaskExecutor ? (
                        <div className="w-full">
                            <div
                                className="flex items-center gap-2 cursor-pointer hover:bg-[#ffffff]/5 rounded px-2 py-1 transition-colors"
                                onClick={() => toggleExpansion(message.id)}
                            >
                                {typeof messageContent === "object" &&
                                    "title" in messageContent && (
                                        <>
                                            <div className="flex-1 font-bold uppercase tracking-wide text-xs">
                                                {(messageContent as FunctionMessageContent).title}
                                            </div>
                                            <div className="flex items-center justify-center w-5 h-5 opacity-80">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </div>
                                        </>
                                    )}
                                {isTaskExecutor && (
                                    <>
                                        <div className="flex-1 font-bold uppercase tracking-wide text-xs">
                                            Task Execution
                                        </div>
                                        <div className="flex items-center justify-center w-5 h-5 opacity-80">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {isExpanded && (
                                <div className="mt-2 pt-2 border-t border-[#6272a4]/30">
                                    {typeof messageContent === "object" &&
                                        "content" in messageContent && (
                                            <>
                                                {/* Try to parse and render JSON if valid */}
                                                {isValidJSON(messageContent.content) ? (
                                                    <JsonViewer
                                                        data={parseEscapedJSON(messageContent.content)}
                                                        defaultExpanded={true}
                                                    />
                                                ) : (
                                                    <div className="max-w-full overflow-x-auto custom-scrollbar">
                                                        <pre className="whitespace-pre-wrap text-xs max-w-full font-mono text-[#f8f8f2]/90" style={{
                                                            wordWrap: "break-word",
                                                            maxWidth: "100%",
                                                            wordBreak: "break-all"
                                                        }}>
                                                            {(messageContent as FunctionMessageContent).content}
                                                        </pre>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="markdown-content break-words max-w-full overflow-x-auto custom-scrollbar">
                            {typeof messageContent === "object" &&
                                "author" in messageContent &&
                                messageContent.author !== "user" &&
                                !isTaskExecutor && (
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6272a4] mb-2">
                                        {messageContent.author}
                                    </div>
                                )}
                            {((typeof messageContent === "string" &&
                                containsMarkdown(messageContent)) ||
                                (typeof messageContent === "object" &&
                                    "content" in messageContent &&
                                    typeof messageContent.content === "string" &&
                                    containsMarkdown(messageContent.content))) &&
                                !isTaskExecutor ? (
                                <div className={`prose ${isUser ? 'prose-headings:text-black prose-p:text-black prose-strong:text-black' : 'prose-invert'} max-w-none prose-sm`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            // Style adaptations for React Markdown rendering in Soft Neubrutalism
                                            h1: ({ ...props }) => (
                                                <h1 className="text-xl font-black my-4 uppercase tracking-wide" {...props} />
                                            ),
                                            h2: ({ ...props }) => (
                                                <h2 className="text-lg font-black my-3 uppercase tracking-wide opacity-90" {...props} />
                                            ),
                                            h3: ({ ...props }) => (
                                                <h3 className="text-base font-bold my-2" {...props} />
                                            ),
                                            a: ({ ...props }) => (
                                                <a
                                                    className="underline hover:opacity-80 transition-opacity font-bold"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    {...props}
                                                />
                                            ),
                                            code: ({ className, children, ...props }: any) => {
                                                const match = /language-(\w+)/.exec(className || "");
                                                const isInline =
                                                    !match &&
                                                    typeof children === "string" &&
                                                    !children.includes("\n");

                                                if (isInline) {
                                                    return (
                                                        <code
                                                            className={`px-1.5 py-0.5 rounded text-sm font-mono ${isUser ? 'bg-black/10 text-black' : 'bg-[#282a36] text-[#ff79c6]'}`}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    );
                                                }

                                                return (
                                                    <div className="my-3 relative group/code bg-[#0b0b11] border-2 border-[#1a1b26] rounded-lg overflow-hidden shadow-sm">
                                                        <div className="bg-[#1a1b26] px-3 py-1 text-xs text-[#6272a4] flex justify-between items-center font-bold uppercase tracking-wider">
                                                            <span>{match?.[1] || "Code"}</span>
                                                            <button
                                                                onClick={copyToClipboard}
                                                                className="text-[#6272a4] hover:text-[#50fa7b] transition-colors"
                                                                title="Copy code"
                                                            >
                                                                {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                            </button>
                                                        </div>
                                                        <pre className="p-3 overflow-x-auto custom-scrollbar whitespace-pre text-sm text-[#f8f8f2] font-mono m-0 bg-[#0b0b11]">
                                                            <code {...props}>{children}</code>
                                                        </pre>
                                                    </div>
                                                );
                                            },
                                            table: ({ ...props }) => (
                                                <div className="overflow-x-auto my-3 border-2 border-[#1a1b26] rounded-lg">
                                                    <table className="min-w-full text-sm" {...props} />
                                                </div>
                                            ),
                                            thead: ({ ...props }) => <thead className="bg-[#1a1b26] font-bold" {...props} />,
                                            th: ({ ...props }) => <th className="px-4 py-2 text-left text-xs uppercase tracking-wider" {...props} />,
                                            td: ({ ...props }) => <td className="px-4 py-2 border-t border-[#1a1b26]" {...props} />,
                                            blockquote: ({ ...props }) => (
                                                <blockquote className="border-l-4 border-[#bd93f9] pl-4 py-1 italic my-3 opacity-80" {...props} />
                                            ),
                                        }}
                                    >
                                        {typeof messageContent === "string"
                                            ? messageContent
                                            : messageContent.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">
                                    {typeof messageContent === "string"
                                        ? messageContent
                                        : messageContent.content}
                                </div>
                            )}

                            {hasInlineData && (
                                <InlineDataAttachments parts={inlineDataParts} sessionId={sessionId} />
                            )}
                        </div>
                    )}

                    <button
                        onClick={copyToClipboard}
                        className={`absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all ${isUser ? 'bg-black/10 text-black hover:bg-black/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        title="Copy message"
                    >
                        {isCopied ? (
                            <Check className="h-3.5 w-3.5" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Memoize to prevent unnecessary re-renders
export const ChatMessage = memo(ChatMessageComponent);
