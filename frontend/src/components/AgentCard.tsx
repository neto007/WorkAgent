import React from 'react';
import type { Agent } from '@/types/agent';
import { Trash2, MessageSquare, Edit, Cpu, Zap, GitBranch, Repeat, Workflow, CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AgentCardProps {
    agent: Agent;
    onDelete: (id: string) => void;
    onEdit: (agent: Agent) => void;
}

const getAgentTypeIcon = (type: string) => {
    switch (type) {
        case 'llm': return <Cpu size={16} />;
        case 'a2a': return <Zap size={16} />;
        case 'sequential': return <GitBranch size={16} />;
        case 'parallel': return <GitBranch size={16} className="rotate-90" />;
        case 'loop': return <Repeat size={16} />;
        case 'workflow': return <Workflow size={16} />;
        case 'task': return <CheckSquare size={16} />;
        default: return <Cpu size={16} />;
    }
};

const getAgentTypeColor = (type: string) => {
    switch (type) {
        case 'llm': return '#bd93f9';
        case 'a2a': return '#ff79c6';
        case 'sequential': return '#8be9fd';
        case 'parallel': return '#50fa7b';
        case 'loop': return '#ffb86c';
        case 'workflow': return '#f1fa8c';
        case 'task': return '#ff5555';
        default: return '#6272a4';
    }
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, onDelete, onEdit }) => {
    const { user } = useAuth();
    const canEdit = user?.role !== 'viewer';
    const typeColor = getAgentTypeColor(agent.agent_type || 'default');

    return (
        <div className="bg-[#0b0b11] border border-[#1a1b26] rounded-lg p-6 hover:border-[#bd93f9] transition-all group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-[14px] font-black uppercase tracking-wider text-[#f8f8f2] mb-2">
                        {agent.name}
                    </h3>
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest"
                        style={{
                            backgroundColor: `${typeColor}20`,
                            color: typeColor,
                            border: `1px solid ${typeColor}40`
                        }}
                    >
                        {getAgentTypeIcon(agent.agent_type || 'default')}
                        {agent.agent_type}
                    </div>
                </div>
            </div>

            {/* Description */}
            {agent.description && (
                <p className="text-[11px] text-[#6272a4] mb-4 line-clamp-2">
                    {agent.description}
                </p>
            )}

            {/* Model Info */}
            {agent.model_name && (
                <div className="mb-4 p-2 bg-[#050101] border border-[#282a36] rounded">
                    <span className="text-[9px] font-bold text-[#8be9fd] uppercase tracking-widest">
                        Model: {agent.model_name}
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-[#1a1b26]">
                {canEdit && (
                    <button
                        onClick={() => onEdit(agent)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#bd93f9]/10 border border-[#bd93f9]/30 text-[#bd93f9] text-[9px] font-black uppercase tracking-widest hover:bg-[#bd93f9]/20 transition-all rounded"
                    >
                        <Edit size={12} />
                        Edit
                    </button>
                )}
                <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#50fa7b]/10 border border-[#50fa7b]/30 text-[#50fa7b] text-[9px] font-black uppercase tracking-widest hover:bg-[#50fa7b]/20 transition-all rounded"
                >
                    <MessageSquare size={12} />
                    Chat
                </button>
                {canEdit && (
                    <button
                        onClick={() => onDelete(agent.id)}
                        className="px-3 py-2 bg-[#ff5555]/10 border border-[#ff5555]/30 text-[#ff5555] text-[9px] font-black uppercase tracking-widest hover:bg-[#ff5555]/20 transition-all rounded"
                    >
                        <Trash2 size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default AgentCard;
