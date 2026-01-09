import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Zap, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatContainerProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
    // agentColor: string; // Not typically used directly as we have themes
    expandedFunctions: Record<string, boolean>;
    toggleFunctionExpansion: (messageId: string) => void;
    containsMarkdown: (text: string) => boolean;
    getMessageText: (message: Message) => string | any;
    agentName?: string;
    className?: string;
    sessionId?: string;
}

export function ChatContainer({
    messages,
    isLoading,
    onSendMessage,
    expandedFunctions,
    toggleFunctionExpansion,
    containsMarkdown,
    getMessageText,
    agentName = "Agent",
    className = "",
    sessionId,
}: ChatContainerProps) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    // Auto-scroll logic
    const scrollToBottom = () => {
        // Only scroll if we have a viewport ref from ScrollArea logic
        // Or if we target the scrollable div inside ScrollArea. 
        // Shadcn ScrollArea usually handles this, or we can use the ref on the container.
        // Let's use a workaround to find the scrollable viewport.
        const scrollableNode = messagesContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollableNode) {
            scrollableNode.scrollTop = scrollableNode.scrollHeight;
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(scrollToBottom, 50);
        }
    }, [messages]);

    // Simulate initial loading
    useEffect(() => {
        if (sessionId) {
            setIsInitializing(true);
            const timer = setTimeout(() => {
                setIsInitializing(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [sessionId]);

    const isEmpty = messages.length === 0;

    return (
        <div className={cn(
            "flex-1 flex flex-col overflow-hidden bg-[#050101] relative",
            className
        )}>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#bd93f9]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#50fa7b]/5 rounded-full blur-[100px] pointer-events-none" />

            <div
                className="flex-1 overflow-hidden p-4 md:p-6"
                style={{ filter: isLoading && !isInitializing ? "blur(0.5px)" : "none" }}
            >
                <ScrollArea
                    ref={messagesContainerRef}
                    className="h-full pr-4"
                >
                    {isInitializing ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                            <div className="w-16 h-16 rounded-2xl bg-[#0b0b11] border-2 border-[#50fa7b] flex items-center justify-center shadow-neu-green mb-6 animate-pulse">
                                <Zap className="h-8 w-8 text-[#50fa7b]" />
                            </div>
                            <p className="text-[#6272a4] font-black uppercase tracking-widest text-xs mb-3">Initializing Connection...</p>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-[#50fa7b] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-[#50fa7b] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-[#50fa7b] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    ) : isEmpty ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 min-h-[400px]">
                            <div className="w-20 h-20 rounded-[2rem] bg-[#1a1b26] border-4 border-[#bd93f9] flex items-center justify-center shadow-neu mb-6 rotate-3 hover:rotate-6 transition-all duration-300">
                                <MessageSquare className="h-10 w-10 text-[#bd93f9]" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
                                Chat with <span className="text-[#50fa7b]">{agentName}</span>
                            </h3>
                            <p className="text-[#6272a4] text-sm max-w-md font-medium leading-relaxed">
                                Start a conversation to explore capabilities, run tasks, or just chat.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 py-4 flex-1">
                            {messages.map((message) => {
                                const messageContent = getMessageText(message);
                                const isExpanded = expandedFunctions[message.id] || false;

                                return (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        isExpanded={isExpanded}
                                        toggleExpansion={toggleFunctionExpansion}
                                        containsMarkdown={containsMarkdown}
                                        messageContent={messageContent}
                                        sessionId={sessionId}
                                    />
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>

            <div className="p-4 md:p-6 border-t-2 border-[#1a1b26] bg-[#0b0b11]/80 backdrop-blur-md z-10">
                {isLoading && !isInitializing && (
                    <div className="px-4 py-2 mb-3 rounded-lg bg-[#1a1b26] border border-[#bd93f9] text-xs text-[#bd93f9] flex items-center w-fit font-bold uppercase tracking-wider animate-pulse">
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Agent is thinking...
                    </div>
                )}
                <ChatInput
                    onSendMessage={onSendMessage}
                    isLoading={isLoading}
                    placeholder="Type your message to start..."
                    autoFocus={true}
                />
            </div>
        </div>
    );
}
