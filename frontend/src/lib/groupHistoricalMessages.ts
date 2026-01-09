import type { Message } from '@/types/chat';
import type { GroupedAgentMessage, ExecutionStepData } from '@/components/chat/AgentExecutionView';

/**
 * Agrupa mensagens históricas que contêm steps em GroupedAgentMessage
 * Usado quando carregamos mensagens do banco de dados
 */
export function groupHistoricalMessages(messages: Message[]): (Message | GroupedAgentMessage)[] {
    const result: (Message | GroupedAgentMessage)[] = [];
    let currentExecution: GroupedAgentMessage | null = null;

    for (const message of messages) {
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.parts?.find((p: any) => p.text)?.text || '';

        // Detectar step message (flexível para timestamp ignorado)
        // Ex: "🔄 Step 11:" ou "🔄 Step 11 (19:20:21):"
        // Tentar parsear se for JSON estruturado (caso de persistência do backend novo)
        let structuredContent: any = null;
        try {
            if (content.trim().startsWith('{')) {
                const parsed = JSON.parse(content);
                if (parsed && typeof parsed === 'object' && 'step' in parsed) {
                    structuredContent = parsed;
                }
            }
        } catch (e) {
            // Não é JSON válido
        }

        // Variáveis para dados extraídos
        let stepNumber: number | null = null;
        let phase: string | null = null;

        if (structuredContent) {
            stepNumber = structuredContent.step;
            phase = (structuredContent.state || structuredContent.phase || 'thinking').toUpperCase();
        } else {
            // Regex legacy
            const stepMatch = content.match(/🔄\s*\*?\*?Step\s+(\d+)(?:.*?)?:\s+(\w+)/i);
            if (stepMatch) {
                stepNumber = parseInt(stepMatch[1]);
                phase = stepMatch[2].toUpperCase();
            }
        }

        if (stepNumber !== null && phase) {

            // Se é Step 1, criar nova execução
            if (stepNumber === 1 || !currentExecution) {
                // Finalizar execução anterior se existir
                if (currentExecution) {
                    result.push(currentExecution);
                }

                // Nova execução
                currentExecution = {
                    id: `exec-hist-${message.id}`,
                    role: 'assistant',
                    executionSteps: [],
                    finalOutput: '',
                    created_at: message.created_at,
                    avatarUrl: (message as any).avatarUrl,
                };
            }

            if (currentExecution) {
                // Extrair dados (Estruturado ou Regex)
                let thinking = '';
                let toolsCalled: string[] | undefined;
                let toolResults: any[] | undefined;

                if (structuredContent) {
                    thinking = structuredContent.thinking || '';
                    if (structuredContent.tools) {
                        toolsCalled = structuredContent.tools.map((t: any) => t.name || t);
                    }
                    if (structuredContent.results) {
                        toolResults = structuredContent.results;
                    }
                } else {
                    // Regex legacy
                    const thinkingMatch = content.match(/💭\s*\*?Thinking\*?:\s*(.+?)(?=\n\n|🛠️|🔄|$)/s) ||
                        content.match(/Thinking:\s*(.+?)(?=\n\n|Tools|Step|$)/i);
                    thinking = thinkingMatch ? thinkingMatch[1].trim() : '';

                    const toolsMatch = content.match(/🛠️\s*Tools Called.*?:(?:\s*\d+\.|\s*[•-])\s*(.+?)(?=\n|$)/i) ||
                        content.match(/Tools Called.*?:(?:\s*\d+\.|\s*[•-])\s*(.+?)(?=\n|$)/i) ||
                        content.match(/🛠️\s*Tools Called.*?:(?:\s*\d+\.|\s*[•-]|)\s*(.+?)(?=\n|$)/i);

                    if (toolsMatch) {
                        toolsCalled = toolsMatch[1].split(/,|;|\n/).map(t => t.trim().replace(/^\d+\.\s*/, '')).filter(Boolean);
                    }

                    const resultsMatch = content.match(/📤\s*Tool Results.*?:[\s\n]*([\s\S]+?)(?=🔄|$)/i) ||
                        content.match(/Tool Results.*?:[\s\n]*([\s\S]+?)(?=Step|$)/i);

                    if (resultsMatch) {
                        toolResults = [resultsMatch[1].trim()];
                    }
                }

                const step: ExecutionStepData = {
                    id: `step-${stepNumber}-${message.id}`,
                    stepNumber,
                    phase: phase as any,
                    title: `Step ${stepNumber}`,
                    content: thinking,
                    toolsCalled,
                    toolResults,
                    startTime: new Date(message.created_at).getTime() / 1000,
                    endTime: phase === 'COMPLETED' || phase === 'ERROR' ? new Date(message.created_at).getTime() / 1000 : undefined,
                };

                currentExecution.executionSteps.push(step);
            }
        } else if (currentExecution && !content.startsWith('🔄') && !content.startsWith('Agent execution') && !(structuredContent && structuredContent.step)) {
            // Mensagem final da execução
            currentExecution.finalOutput = content.trim();
            result.push(currentExecution);
            currentExecution = null;
        } else {
            // Mensagem regular
            if (currentExecution) {
                result.push(currentExecution);
                currentExecution = null;
            }
            result.push(message);
        }
    }

    // Adicionar última execução se existir
    if (currentExecution) {
        result.push(currentExecution);
    }

    return result;
}
