import { ChevronDown, ChevronRight, Brain, Wrench, CheckCircle, XCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ExecutionStepData {
    id: string;
    stepNumber: number;
    phase: 'THINKING' | 'CALLING_TOOL' | 'COMPLETED' | 'ERROR';
    title: string;
    content: string;
    toolsCalled?: string[];
    toolResults?: any[];
    startTime: number;
    endTime?: number;
}

interface ExecutionStepProps {
    step: ExecutionStepData;
    isExpanded: boolean;
    onToggle: () => void;
}

export const ExecutionStep = ({ step, isExpanded, onToggle }: ExecutionStepProps) => {
    // Determinar se houve erro nos toolResults
    const hasError = step.toolResults?.some((r: any) =>
        typeof r === 'object' && r !== null && r.success === false
    ) || false;

    // Auto-expandir apenas steps pensando (sem conteúdo) ou com erro
    const shouldAutoExpand = step.phase === 'THINKING' || hasError;
    const effectivelyExpanded = isExpanded || shouldAutoExpand;

    const getPhaseIcon = () => {
        switch (step.phase) {
            case 'THINKING':
                return <Brain className="h-4 w-4 text-[#bd93f9] animate-pulse" />;
            case 'CALLING_TOOL':
                return <Wrench className="h-4 w-4 text-[#ffb86c]" />;
            case 'COMPLETED':
                return <CheckCircle className="h-4 w-4 text-[#50fa7b]" />;
            case 'ERROR':
                return <XCircle className="h-4 w-4 text-[#ff5555]" />;
            default:
                return <Clock className="h-4 w-4 text-[#6272a4]" />;
        }
    };

    const getPhaseColor = () => {
        switch (step.phase) {
            case 'THINKING':
                return 'border-[#bd93f9]/30 bg-[#bd93f9]/5';
            case 'CALLING_TOOL':
                return 'border-[#ffb86c]/30 bg-[#ffb86c]/5';
            case 'COMPLETED':
                // Verde se sucesso, vermelho se erro nos results
                return hasError
                    ? 'border-[#ff5555]/30 bg-[#ff5555]/5'
                    : 'border-[#50fa7b]/30 bg-[#50fa7b]/5';
            case 'ERROR':
                return 'border-[#ff5555]/30 bg-[#ff5555]/5';
            default:
                return 'border-[#6272a4]/30 bg-[#6272a4]/5';
        }
    };

    const getDuration = () => {
        if (!step.endTime) return null;
        const duration = (step.endTime - step.startTime) / 1000;
        return `${duration.toFixed(1)}s`;
    };

    const getPhaseLabel = () => {
        switch (step.phase) {
            case 'THINKING':
                return '🧠 Pensando';
            case 'CALLING_TOOL':
                return '⚙️ Planejador';
            case 'COMPLETED':
                return hasError ? '❌ Concluído (Falha)' : '✅ Concluído (Sucesso)';
            case 'ERROR':
                return '❌ Erro';
            default:
                return step.phase;
        }
    };

    return (
        <div className={`border-2 rounded-lg overflow-hidden transition-all ${getPhaseColor()}`}>
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center">
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-[#f8f8f2]" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-[#f8f8f2]" />
                        )}
                    </div>

                    {getPhaseIcon()}

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#f8f8f2]">
                                Step {step.stepNumber}:
                            </span>
                            <span className="font-mono text-sm text-[#f8f8f2]">
                                {getPhaseLabel()}
                            </span>
                        </div>
                        {!effectivelyExpanded && step.toolsCalled && step.toolsCalled.length > 0 && (
                            <div className="text-xs text-[#6272a4] mt-1">
                                Tools: {step.toolsCalled.join(', ')}
                            </div>
                        )}
                    </div>

                    {getDuration() && (
                        <div className="text-xs font-mono text-[#6272a4] bg-[#1a1b26] px-2 py-1 rounded">
                            {getDuration()}
                        </div>
                    )}
                </div>
            </div>

            {effectivelyExpanded && (step.content || step.toolsCalled?.length || step.toolResults?.length) && (
                <div className="border-t border-[#1a1b26]/50 p-4 bg-[#0b0b11]/50">
                    {step.content && (
                        <div className="mb-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-[#6272a4] mb-2">
                                Detalhes
                            </div>
                            {(() => {
                                // Se estiver vazio, mostrar animação de loading
                                if (!step.content || step.content.trim() === '') {
                                    return (
                                        <div className="flex items-center gap-2 text-xs text-[#6272a4] p-3">
                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#bd93f9] border-t-transparent"></div>
                                            <span className="animate-pulse">Processando...</span>
                                        </div>
                                    );
                                }

                                // Tentar detectar JSON dentro do texto
                                const jsonMatch = step.content.match(/(\w+)\s*({[\s\S]+})/);

                                if (jsonMatch) {
                                    const [, toolName, jsonStr] = jsonMatch;
                                    try {
                                        const parsed = JSON.parse(jsonStr);
                                        return (
                                            <div className="space-y-2">
                                                <div className="text-xs bg-[#ffb86c]/20 text-[#ffb86c] px-2 py-1 rounded inline-block font-mono">
                                                    {toolName}
                                                </div>
                                                <pre className="text-xs text-[#f8f8f2] whitespace-pre-wrap font-mono bg-[#1a1b26] p-3 rounded border border-[#282a36] overflow-x-auto">
                                                    {JSON.stringify(parsed, null, 2)}
                                                </pre>
                                            </div>
                                        );
                                    } catch {
                                        // Se não conseguir fazer parse, exibir como texto normal
                                    }
                                }

                                // Renderizar com markdown
                                return (
                                    <div className="prose prose-invert max-w-none prose-sm">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code: ({ className, children, ...props }: any) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    const isInline = !match && typeof children === 'string' && !children.includes('\n');

                                                    if (isInline) {
                                                        return (
                                                            <code className="px-1.5 py-0.5 rounded text-sm font-mono bg-[#282a36] text-[#ff79c6]" {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }

                                                    return (
                                                        <div className="my-2 relative group/code bg-[#0b0b11] border-2 border-[#1a1b26] rounded-lg overflow-hidden">
                                                            <div className="bg-[#1a1b26] px-3 py-1 text-xs text-[#6272a4] font-bold uppercase tracking-wider">
                                                                {match?.[1] || 'Code'}
                                                            </div>
                                                            <pre className="p-3 overflow-x-auto custom-scrollbar whitespace-pre text-sm text-[#f8f8f2] font-mono m-0 bg-[#0b0b11]">
                                                                <code {...props}>{children}</code>
                                                            </pre>
                                                        </div>
                                                    );
                                                },
                                            }}
                                        >
                                            {step.content}
                                        </ReactMarkdown>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {step.toolsCalled && step.toolsCalled.length > 0 && (
                        <div className="mb-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-[#6272a4] mb-2">
                                🛠️ Ferramentas Utilizadas
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {step.toolsCalled.map((tool, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-[#ffb86c]/20 text-[#ffb86c] px-2 py-1 rounded font-mono"
                                    >
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {step.toolResults && step.toolResults.length > 0 && (
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-[#6272a4] mb-2">
                                📤 Resultados
                            </div>
                            <div className="space-y-2">
                                {step.toolResults.map((result, idx) => {
                                    // Nova estrutura A2A: {success, result, error, call_id, tool_name}
                                    const isNewFormat = typeof result === 'object' && result !== null && 'success' in result;

                                    if (isNewFormat) {
                                        const success = result.success;
                                        const output = result.result || result.output || ''; // Suportar ambos
                                        const error = result.error;
                                        const toolName = result.tool_name;

                                        return (
                                            <div key={idx} className="space-y-1">
                                                {/* Status Badge */}
                                                <div className="flex items-center gap-2">
                                                    {toolName && (
                                                        <span className="text-xs bg-[#ffb86c]/20 text-[#ffb86c] px-2 py-1 rounded font-mono">
                                                            {toolName}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs px-2 py-1 rounded font-mono ${success
                                                        ? 'bg-[#50fa7b]/20 text-[#50fa7b]'
                                                        : 'bg-[#ff5555]/20 text-[#ff5555]'
                                                        }`}>
                                                        {success ? '✅ Sucesso' : '❌ Falha'}
                                                    </span>
                                                </div>

                                                {/* Output/Error com Markdown */}
                                                {(() => {
                                                    const content = error || output || 'Sem saída';

                                                    // Tentar detectar se é JSON ou objeto
                                                    if (typeof content === 'object') {
                                                        return (
                                                            <div className="my-2 relative bg-[#0b0b11] border-2 border-[#1a1b26] rounded-lg overflow-hidden">
                                                                <div className="bg-[#1a1b26] px-3 py-1 text-xs text-[#6272a4] font-bold uppercase tracking-wider">
                                                                    JSON
                                                                </div>
                                                                <pre className={`p-3 overflow-x-auto custom-scrollbar whitespace-pre text-sm font-mono max-h-96 ${success
                                                                        ? 'bg-[#0b0b11] text-[#f8f8f2]'
                                                                        : 'bg-[#ff5555]/10 text-[#ff5555]'
                                                                    }`}>
                                                                    {JSON.stringify(content, null, 2)}
                                                                </pre>
                                                            </div>
                                                        );
                                                    }

                                                    // String: Renderizar com markdown
                                                    return (
                                                        <div className={`my-2 relative border-2 rounded-lg overflow-hidden ${success
                                                                ? 'bg-[#0b0b11] border-[#1a1b26]'
                                                                : 'bg-[#ff5555]/10 border-[#ff5555]/30'
                                                            }`}>
                                                            <div className="p-3 prose prose-invert max-w-none prose-sm">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        code: ({ className, children, ...props }: any) => {
                                                                            const match = /language-(\w+)/.exec(className || '');
                                                                            const isInline = !match && typeof children === 'string' && !children.includes('\n');

                                                                            if (isInline) {
                                                                                return (
                                                                                    <code className="px-1.5 py-0.5 rounded text-sm font-mono bg-[#282a36] text-[#ff79c6]" {...props}>
                                                                                        {children}
                                                                                    </code>
                                                                                );
                                                                            }

                                                                            return (
                                                                                <div className="my-2 relative bg-[#0b0b11] border-2 border-[#282a36] rounded-lg overflow-hidden">
                                                                                    <div className="bg-[#1a1b26] px-3 py-1 text-xs text-[#6272a4] font-bold uppercase tracking-wider">
                                                                                        {match?.[1] || 'Code'}
                                                                                    </div>
                                                                                    <pre className="p-3 overflow-x-auto custom-scrollbar whitespace-pre text-sm text-[#f8f8f2] font-mono m-0 bg-[#0b0b11]">
                                                                                        <code {...props}>{children}</code>
                                                                                    </pre>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    }}
                                                                >
                                                                    {String(content)}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        );
                                    }

                                    // Formato antigo (string ou objeto genérico)
                                    return (
                                        <pre
                                            key={idx}
                                            className="text-xs text-[#f8f8f2] whitespace-pre-wrap font-mono bg-[#1a1b26] p-3 rounded border border-[#282a36] max-h-40 overflow-y-auto custom-scrollbar"
                                        >
                                            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                                        </pre>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
