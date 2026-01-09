import { useState } from 'react';
import { ExecutionStep, type ExecutionStepData } from './ExecutionStep';
export type { ExecutionStepData };
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface GroupedAgentMessage {
    id: string;
    role: 'assistant';
    executionSteps: ExecutionStepData[];
    finalOutput: string;
    totalDuration?: number;
    created_at: string;
    avatarUrl?: string;
}

interface AgentExecutionViewProps {
    execution: GroupedAgentMessage;
    containsMarkdown: (text: string) => boolean;
}

export const AgentExecutionView = ({ execution, containsMarkdown }: AgentExecutionViewProps) => {
    const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
    const [showAllSteps, setShowAllSteps] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const toggleStep = (stepId: string) => {
        setExpandedSteps(prev => ({
            ...prev,
            [stepId]: !prev[stepId]
        }));
    };

    const toggleAllSteps = () => {
        const newState = !showAllSteps;
        setShowAllSteps(newState);

        // Expand/collapse all steps
        const newExpandedSteps: Record<string, boolean> = {};
        execution.executionSteps.forEach(step => {
            newExpandedSteps[step.id] = newState;
        });
        setExpandedSteps(newExpandedSteps);
    };

    const copyFinalOutput = () => {
        navigator.clipboard.writeText(execution.finalOutput).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const hasSteps = execution.executionSteps && execution.executionSteps.length > 0;
    const completedSteps = execution.executionSteps?.filter(s => s.phase === 'COMPLETED').length || 0;
    const totalSteps = execution.executionSteps?.length || 0;

    return (
        <div className="flex w-full mb-6">
            <div className="flex gap-4 max-w-[90%]">
                {/* Avatar */}
                {execution.avatarUrl ? (
                    <img
                        src={execution.avatarUrl}
                        alt="Agent Avatar"
                        className="h-10 w-10 object-contain flex-shrink-0 rounded-full"
                    />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-[#bd93f9] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#282a36] font-bold">AI</span>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 space-y-3">
                    {/* Execution Steps Section */}
                    {hasSteps && (
                        <div className="bg-[#0b0b11] border-2 border-[#1a1b26] rounded-xl p-4 shadow-neu-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#1a1b26]">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-[#50fa7b] animate-pulse"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#6272a4]">
                                        Execução do Agente
                                    </span>
                                    <span className="text-xs text-[#6272a4]">
                                        ({completedSteps}/{totalSteps} steps)
                                    </span>
                                </div>
                                <button
                                    onClick={toggleAllSteps}
                                    className="flex items-center gap-2 text-xs text-[#bd93f9] hover:text-[#bd93f9]/80 transition-colors"
                                >
                                    {showAllSteps ? (
                                        <>
                                            <ChevronUp className="h-3 w-3" />
                                            Ocultar Detalhes
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-3 w-3" />
                                            Ver Execução
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Steps */}
                            <div className="space-y-2">
                                {execution.executionSteps.map((step) => (
                                    <ExecutionStep
                                        key={step.id}
                                        step={step}
                                        isExpanded={expandedSteps[step.id] || false}
                                        onToggle={() => toggleStep(step.id)}
                                    />
                                ))}
                            </div>

                            {/* Duration */}
                            {execution.totalDuration && (
                                <div className="mt-3 pt-3 border-t border-[#1a1b26] text-xs text-[#6272a4] text-right">
                                    Tempo total: {execution.totalDuration.toFixed(1)}s
                                </div>
                            )}
                        </div>
                    )}

                    {/* Final Output */}
                    {execution.finalOutput && (
                        <div className="bg-[#0b0b11] border-2 border-[#50fa7b]/30 rounded-2xl p-4 shadow-neu-sm relative group">
                            {/* Success Badge */}
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#1a1b26]">
                                <div className="h-2 w-2 rounded-full bg-[#50fa7b]"></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-[#50fa7b]">
                                    ✅ Resposta Final
                                </span>
                            </div>

                            {/* Content */}
                            <div className="markdown-content break-words max-w-full overflow-x-auto custom-scrollbar">
                                <div className="prose prose-invert max-w-none prose-sm">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
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
                                                    className="underline hover:opacity-80 transition-opacity font-bold text-[#bd93f9]"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    {...props}
                                                />
                                            ),
                                            code: ({ className, children, ...props }: any) => {
                                                const match = /language-(\w+)/.exec(className || "");
                                                const isInline = !match && typeof children === "string" && !children.includes("\n");

                                                if (isInline) {
                                                    return (
                                                        <code
                                                            className="px-1.5 py-0.5 rounded text-sm font-mono bg-[#282a36] text-[#ff79c6]"
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
                                        {execution.finalOutput}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={copyFinalOutput}
                                className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all bg-white/10 text-white hover:bg-white/20"
                                title="Copy response"
                            >
                                {isCopied ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
