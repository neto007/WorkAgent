/*
 * @author: Davidson Gomes
 * @file: /components/agents/AgentTypeSelector.tsx
 * FlowSec Theme
 */
import React from 'react';
import type { AgentType } from '@/types/agent';
import { Cpu, Zap, GitBranch, Repeat, Workflow, CheckSquare, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentTypeSelectorProps {
    value: AgentType | '';
    onChange: (type: AgentType | '') => void;
}

const agentTypes = [
    { value: '', label: 'All', icon: Cpu, color: '#6272a4', glow: '0_0_10px_rgba(98,114,164,0.3)' },
    { value: 'llm', label: 'LLM', icon: Cpu, color: '#50fa7b', glow: '0_0_10px_rgba(80,250,123,0.4)' },
    { value: 'a2a', label: 'A2A', icon: Zap, color: '#bd93f9', glow: '0_0_10px_rgba(189,147,249,0.4)' },
    { value: 'sequential', label: 'Sequential', icon: ArrowRight, color: '#f1fa8c', glow: '0_0_10px_rgba(241,250,140,0.4)' },
    { value: 'parallel', label: 'Parallel', icon: GitBranch, color: '#8be9fd', glow: '0_0_10px_rgba(139,233,253,0.4)' },
    { value: 'loop', label: 'Loop', icon: Repeat, color: '#ffb86c', glow: '0_0_10px_rgba(255,184,108,0.4)' },
    { value: 'workflow', label: 'Workflow', icon: Workflow, color: '#ff79c6', glow: '0_0_10px_rgba(255,121,198,0.4)' },
    { value: 'task', label: 'Task', icon: CheckSquare, color: '#ff5555', glow: '0_0_10px_rgba(255,85,85,0.4)' },
];

const AgentTypeSelector: React.FC<AgentTypeSelectorProps> = ({ value, onChange }) => {
    return (
        <div className="flex gap-2 flex-wrap items-center">
            {agentTypes.map((type) => {
                const Icon = type.icon;
                const isActive = value === type.value;

                return (
                    <button
                        key={type.value}
                        onClick={() => onChange(type.value as AgentType | '')}
                        className={cn(
                            "relative flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 font-jetbrains",
                            "border backdrop-blur-sm",
                            isActive
                                ? "bg-[#1a1b26] border-current scale-105"
                                : "bg-[#1a1b26]/40 border-[#44475a]/30 hover:bg-[#1a1b26]/60 hover:border-[#44475a] hover:scale-105"
                        )}
                        style={{
                            color: isActive ? type.color : '#6272a4',
                            borderColor: isActive ? type.color + '80' : undefined,
                            boxShadow: isActive ? type.glow : undefined,
                        }}
                    >
                        <Icon className="w-3 h-3" />
                        {type.label}
                        {isActive && (
                            <div
                                className="absolute inset-0 rounded-lg opacity-20 blur-sm -z-10"
                                style={{ backgroundColor: type.color }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default AgentTypeSelector;
