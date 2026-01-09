import type { Message } from '@/types/chat';
import type { GroupedAgentMessage } from '@/components/chat/AgentExecutionView';
import type { ExecutionStepData } from '@/components/chat/ExecutionStep';

/**
 * Groups agent execution messages into a structured format
 * Handles progressive/incremental updates by consolidating them into single steps
 */
export class AgentMessageGrouper {
    private currentExecution: GroupedAgentMessage | null = null;

    /**
     * Process an incoming message and determine if it should be grouped
     */
    processMessage(message: Message): Message | GroupedAgentMessage {
        const content = this.getMessageContent(message);

        // Ignorar mensagens do usuário
        if (message.role === 'user' || message.author === 'user') {
            return message;
        }

        // Verificar se é início de execução
        if (content.includes('Agent execution started') || content.includes('execution started')) {
            return this.startNewExecution(message);
        }

        // Verificar se é um step (padrão: "🔄 Step X: PHASE")
        const stepMatch = content.match(/🔄\s*Step\s+(\d+):\s+(\w+)/i);

        if (stepMatch) {
            const stepNum = parseInt(stepMatch[1]);
            const phase = stepMatch[2];
            return this.handleStepMessage(message, stepNum, phase, content);
        }

        // Se há uma execução ativa mas não é um step, pode ser mensagem final
        if (this.currentExecution && !content.startsWith('🔄')) {
            return this.finalizeExecution(message, content);
        }

        // Mensagem regular
        return message;
    }

    private getMessageContent(message: Message): string {
        if (typeof message.content === 'string') {
            return message.content;
        }

        const parts = message.content?.parts || [];
        const textParts = parts
            .filter((p: any) => p.text)
            .map((p: any) => p.text);

        return textParts.join('\n');
    }

    private startNewExecution(message: Message): Message {
        this.currentExecution = {
            id: `exec-${message.id}`,
            role: 'assistant',
            executionSteps: [],
            finalOutput: '',
            totalDuration: 0,
            created_at: message.created_at,
            avatarUrl: (message as any).avatarUrl,
        };

        // Não retornar esta mensagem (será substituída pela execução agrupada)
        return message;
    }

    private handleStepMessage(
        message: Message,
        stepNumber: number,
        phase: string,
        content: string
    ): Message | GroupedAgentMessage {
        // Se não há execução ativa, criar uma
        if (!this.currentExecution) {
            this.startNewExecution(message);
        }

        // Encontrar ou criar o step
        let step = this.currentExecution!.executionSteps.find(s => s.stepNumber === stepNumber);

        const normalizedPhase = this.normalizePhase(phase);
        const thinking = this.extractThinking(content);
        const tools = this.extractToolsCalled(content);
        const results = this.extractToolResults(content);

        if (!step) {
            // Novo step
            step = {
                id: `step-${stepNumber}-${Date.now()}`,
                stepNumber,
                phase: normalizedPhase,
                title: `Step ${stepNumber}: ${normalizedPhase}`,
                content: thinking,
                toolsCalled: tools,
                toolResults: results,
                startTime: message.timestamp || Date.now() / 1000,
            };
            this.currentExecution!.executionSteps.push(step);
        } else {
            // Atualizar step existente (mensagem progressiva)
            step.phase = normalizedPhase;
            if (thinking) {
                step.content = thinking; // Substituir com versão mais completa
            }

            if (tools.length > 0) {
                step.toolsCalled = tools;
            }

            if (results.length > 0) {
                step.toolResults = results;
            }

            // Se mudou para COMPLETED ou ERROR, definir endTime
            if (normalizedPhase === 'COMPLETED' || normalizedPhase === 'ERROR') {
                step.endTime = message.timestamp || Date.now() / 1000;
            }
        }

        // Retornar execução agrupada atualizada
        return { ...this.currentExecution! };
    }

    private finalizeExecution(message: Message, content: string): GroupedAgentMessage {
        if (!this.currentExecution) {
            return message as any;
        }

        // Extrair output final
        this.currentExecution.finalOutput = content.trim();

        // Calcular duração total
        const steps = this.currentExecution.executionSteps;
        if (steps.length > 0) {
            const firstStep = steps[0];
            const lastStep = steps[steps.length - 1];
            if (firstStep.startTime && lastStep.endTime) {
                this.currentExecution.totalDuration = lastStep.endTime - firstStep.startTime;
            }
        }

        const finalized = { ...this.currentExecution };

        // Reset para próxima execução
        this.reset();

        return finalized;
    }

    private normalizePhase(phase: string): ExecutionStepData['phase'] {
        const upper = phase.toUpperCase();
        if (upper.includes('THINK')) return 'THINKING';
        if (upper.includes('TOOL') || upper.includes('CALL')) return 'CALLING_TOOL';
        if (upper.includes('COMPLETE') || upper.includes('DONE')) return 'COMPLETED';
        if (upper.includes('ERROR') || upper.includes('FAIL')) return 'ERROR';
        return 'THINKING';
    }

    private extractThinking(content: string): string {
        // Extrair conteúdo após "💭 Thinking:"
        const thinkingMatch = content.match(/💭\s*Thinking:\s*(.+?)(?=\n\n|$)/s);
        if (thinkingMatch) {
            return thinkingMatch[1].trim();
        }

        // Fallback: retornar conteúdo sem emojis de step
        return content.replace(/🔄\s*Step\s+\d+:\s+\w+\s*/i, '').trim();
    }

    private extractToolsCalled(content: string): string[] {
        const toolsMatch = content.match(/🛠️\s*Tools Called:\s*•\s*(.+?)(?=\n|$)/);
        if (toolsMatch) {
            return toolsMatch[1].split('•').map(t => t.trim()).filter(Boolean);
        }
        return [];
    }

    private extractToolResults(content: string): any[] {
        const resultsMatch = content.match(/📤\s*Tool Results:\s*\n([\s\S]+?)(?=🔄|$)/);
        if (resultsMatch) {
            return [resultsMatch[1].trim()];
        }
        return [];
    }

    /**
     * Get current execution state (for debugging)
     */
    getCurrentState(): GroupedAgentMessage | null {
        return this.currentExecution;
    }

    /**
     * Reset grouper state
     */
    reset() {
        this.currentExecution = null;
    }
}
