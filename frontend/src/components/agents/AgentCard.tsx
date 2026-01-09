/*
 * @author: Davidson Gomes
 * @file: /components/agents/AgentCard.tsx
 * FlowSec Theme - Cores Neon Vibrantes
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Folder } from "@/services/agentService";
import { AgentType } from "@/types/agent";
import type { Agent } from "@/types/agent";
import type { MCPServer } from "@/types/mcpServer";
import {
    ArrowRight,
    Bot,
    BookOpenCheck,
    ChevronDown,
    ChevronUp,
    Code,
    ExternalLink,
    GitBranch,
    MoreVertical,
    MoveRight,
    Pencil,
    RefreshCw,
    Share2,
    Trash2,
    Workflow,
    Download,
    FlaskConical,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn, exportAsJson } from "@/lib/utils";
import { getApiUrl } from "@/lib/env";

interface AgentCardProps {
    agent: Agent;
    onEdit: (agent: Agent) => void;
    onDelete: (agent: Agent) => void;
    onMove: (agent: Agent) => void;
    onShare?: (agent: Agent) => void;
    onWorkflow?: (agentId: string) => void;
    availableMCPs?: MCPServer[];
    getApiKeyNameById?: (id: string | undefined) => string | null;
    getAgentNameById?: (id: string) => string;
    folders?: Folder[];
    agents: Agent[];
}

export function AgentCard({
    agent,
    onEdit,
    onDelete,
    onMove,
    onShare,
    onWorkflow,
    getApiKeyNameById = () => null,
    folders = [],
}: AgentCardProps) {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    const getAgentTypeInfo = (type: AgentType) => {
        const types: Record<
            string,
            {
                label: string;
                icon: React.ElementType;
                color: string;
                bgColor: string;
                glowColor: string;
                badgeClass: string;
            }
        > = {
            [AgentType.LLM]: {
                label: "LLM",
                icon: Code,
                color: "#00ff7f",
                bgColor: "bg-transparent",
                glowColor: "rgba(0,255,127,",
                badgeClass: "bg-transparent text-[#00ff7f] border-[#00ff7f]",
            },
            [AgentType.A2A]: {
                label: "A2A",
                icon: ExternalLink,
                color: "#bd93f9",
                bgColor: "bg-transparent",
                glowColor: "rgba(189,147,249,",
                badgeClass: "bg-transparent text-[#bd93f9] border-[#bd93f9]",
            },
            [AgentType.SEQUENTIAL]: {
                label: "Sequential",
                icon: ArrowRight,
                color: "#f1fa8c",
                bgColor: "bg-transparent",
                glowColor: "rgba(241,250,140,",
                badgeClass: "bg-transparent text-[#f1fa8c] border-[#f1fa8c]",
            },
            [AgentType.PARALLEL]: {
                label: "Parallel",
                icon: GitBranch,
                color: "#ff79c6",
                bgColor: "bg-transparent",
                glowColor: "rgba(255,121,198,",
                badgeClass: "bg-transparent text-[#ff79c6] border-[#ff79c6]",
            },
            [AgentType.LOOP]: {
                label: "Loop",
                icon: RefreshCw,
                color: "#ffb86c",
                bgColor: "bg-transparent",
                glowColor: "rgba(255,184,108,",
                badgeClass: "bg-transparent text-[#ffb86c] border-[#ffb86c]",
            },
            [AgentType.WORKFLOW]: {
                label: "Workflow",
                icon: Workflow,
                color: "#8be9fd",
                bgColor: "bg-transparent",
                glowColor: "rgba(139,233,253,",
                badgeClass: "bg-transparent text-[#8be9fd] border-[#8be9fd]",
            },
            [AgentType.TASK]: {
                label: "Task",
                icon: BookOpenCheck,
                color: "#ff5555",
                bgColor: "bg-transparent",
                glowColor: "rgba(255,85,85,",
                badgeClass: "bg-transparent text-[#ff5555] border-[#ff5555]",
            },
        };

        return (
            types[type] || {
                label: type,
                icon: Bot,
                color: "#6272a4",
                bgColor: "bg-[#6272a4]/10",
                glowColor: "rgba(98,114,164,",
                badgeClass: "bg-[#6272a4]/20 text-[#6272a4] border-[#6272a4]/40",
            }
        );
    };

    const typeInfo = getAgentTypeInfo(agent.type);
    const IconComponent = typeInfo.icon;

    const getFolderNameById = (id: string) => {
        const folder = folders?.find((f) => f.id === id);
        return folder?.name || id;
    };

    const getTotalTools = () => {
        if (agent.type === AgentType.LLM && agent.config?.mcp_servers) {
            return agent.config.mcp_servers.reduce(
                (total, mcp) => total + (mcp.tools?.length || 0),
                0
            );
        }
        return 0;
    };

    const handleExportAgent = () => {
        try {
            const filename = `agent-${agent.name.toLowerCase().replace(/\s+/g, '-')}`;
            const result = exportAsJson(agent, filename, true);

            if (!result) {
                console.error('Failed to export agent');
            }
        } catch (error) {
            console.error('Error exporting agent:', error);
        }
    };

    const handleTestA2A = () => {
        const agentUrl = agent.agent_card_url?.replace("/.well-known/agent.json", "");
        const apiKey = agent.config?.api_key;
        const params = new URLSearchParams();

        if (agentUrl) params.set("agent_url", agentUrl);
        if (apiKey) params.set("api_key", apiKey);

        navigate(`/documentation?${params.toString()}#lab`);
    };

    const getAvatarUrl = (url: string | undefined | null) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;

        const baseUrl = getApiUrl();
        // Se baseUrl for vazia, assume que o proxy do vite lidará com urls relativas
        // ou que a imagem está no mesmo host
        if (!baseUrl) return url;

        // Remove barra duplicada se necessário
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;

        return `${cleanBase}${cleanUrl}`;
    };

    return (
        <Card
            className="w-full h-full flex flex-col overflow-hidden border-2 bg-[#0b0b11] shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            style={{
                borderColor: typeInfo.color,
                boxShadow: `0 0 10px ${typeInfo.glowColor}0.3), 0 0 20px ${typeInfo.glowColor}0.1)`,
            }}
        >
            {/* Header */}
            <div
                className={cn("h-[88px] p-4 flex justify-between items-center border-b border-[#1a1b26]", typeInfo.bgColor)}
                style={{
                    boxShadow: `inset 0 0 15px ${typeInfo.glowColor}0.1)`,
                }}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {agent.avatar_url ? (
                        <img
                            src={getAvatarUrl(agent.avatar_url) || ''}
                            alt={agent.name}
                            className="h-18 w-18 object-contain flex-shrink-0"
                            onError={(e) => {
                                // Fallback to icon with container if image fails
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}
                    <div
                        className="flex-shrink-0 p-2 rounded bg-[#050101] border border-current"
                        style={{
                            borderColor: typeInfo.color,
                            boxShadow: `0 0 8px ${typeInfo.glowColor}0.3)`,
                            display: agent.avatar_url ? 'none' : 'flex'
                        }}
                    >
                        <IconComponent
                            className="h-9 w-9"
                            style={{
                                color: typeInfo.color,
                                filter: `drop-shadow(0 0 5px ${typeInfo.glowColor}0.6))`,
                            }}
                        />
                    </div>
                    <h3
                        className="font-black text-white text-sm uppercase tracking-wider truncate"
                        style={{
                            textShadow: `0 0 5px ${typeInfo.glowColor}0.4), 0 0 2px black`,
                        }}
                    >
                        {agent.name}
                    </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                        variant="outline"
                        className={cn("border text-[9px] font-black uppercase tracking-widest", typeInfo.badgeClass)}
                        style={{
                            boxShadow: `0 0 5px ${typeInfo.glowColor}0.2)`,
                        }}
                    >
                        {typeInfo.label}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#6272a4] hover:text-[#f8f8f2] hover:bg-[#1a1b26]">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0b0b11] border-[#1a1b26] min-w-[180px]" align="end">
                            <DropdownMenuItem onClick={handleTestA2A} className="text-[#f8f8f2] hover:bg-[#1a1b26] cursor-pointer text-[10px] font-bold">
                                <FlaskConical className="h-4 w-4 mr-2 text-[#00ff7f]" />
                                Test_A2A
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(agent)} className="text-[#f8f8f2] hover:bg-[#1a1b26] cursor-pointer text-[10px] font-bold">
                                <Pencil className="h-4 w-4 mr-2 text-[#00ff7f]" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMove(agent)} className="text-[#f8f8f2] hover:bg-[#1a1b26] cursor-pointer text-[10px] font-bold">
                                <MoveRight className="h-4 w-4 mr-2 text-[#f1fa8c]" />
                                Move
                            </DropdownMenuItem>
                            {onWorkflow && agent.type === AgentType.WORKFLOW && (
                                <DropdownMenuItem onClick={() => onWorkflow(agent.id)} className="text-[#f8f8f2] hover:bg-[#1a1b26] cursor-pointer text-[10px] font-bold">
                                    <Workflow className="h-4 w-4 mr-2 text-[#8be9fd]" />
                                    Workflow
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={handleExportAgent} className="text-[#f8f8f2] hover:bg-[#1a1b26] cursor-pointer text-[10px] font-bold">
                                <Download className="h-4 w-4 mr-2 text-[#bd93f9]" />
                                Export
                            </DropdownMenuItem>
                            {onShare && (
                                <DropdownMenuItem onClick={() => onShare(agent)} className="text-[#f8f8f2] hover:bg-[#1a1b26] cursor-pointer text-[10px] font-bold">
                                    <Share2 className="h-4 w-4 mr-2 text-[#8be9fd]" />
                                    Share
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onDelete(agent)} className="text-[#ff5555] hover:bg-[#ff5555]/10 cursor-pointer text-[10px] font-bold">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <CardContent className="p-0 flex flex-col flex-1">
                {/* Description */}
                <div className="h-[72px] p-4 border-b border-[#1a1b26] flex flex-col justify-start">
                    <p className="text-[10px] text-[#6272a4] font-mono leading-relaxed line-clamp-3">
                        {agent.description || "No_description_available"}
                    </p>
                </div>

                {/* Model Info */}
                <div
                    className={cn("p-4 flex justify-between items-center", typeInfo.bgColor)}
                    style={{
                        boxShadow: `inset 0 0 20px ${typeInfo.glowColor}0.08)`,
                    }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-[#6272a4] font-black uppercase tracking-widest">Model:</span>
                        <span
                            className="text-[10px] font-mono font-semibold"
                            style={{
                                color: typeInfo.color,
                                textShadow: `0 0 8px ${typeInfo.glowColor}0.4)`,
                            }}
                        >
                            {agent.type === AgentType.LLM ? (agent.model || "N/A") : "N/A"}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-[#6272a4] hover:text-[#bd93f9] transition-colors text-[9px] uppercase font-black tracking-widest"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                        {expanded ? "Less" : "More"}
                    </Button>
                </div>

                {/* Expanded Details */}
                {expanded && (
                    <div className="p-4 bg-[#050101] border-t border-[#1a1b26] text-[10px] space-y-3 animate-in fade-in-50 duration-200 font-mono">
                        {agent.folder_id && (
                            <div className="flex justify-between items-center">
                                <span className="text-[#6272a4] font-black uppercase tracking-widest text-[9px]">Folder:</span>
                                <Badge
                                    variant="outline"
                                    className={cn("h-5 px-2 bg-transparent text-[9px] font-bold", typeInfo.badgeClass)}
                                    style={{
                                        boxShadow: `0 0 8px ${typeInfo.glowColor}0.2)`,
                                    }}
                                >
                                    {getFolderNameById(agent.folder_id)}
                                </Badge>
                            </div>
                        )}

                        {agent.type === AgentType.LLM && agent.api_key_id && (
                            <div className="flex justify-between items-center">
                                <span className="text-[#6272a4] font-black uppercase tracking-widest text-[9px]">API_Key:</span>
                                <Badge
                                    variant="outline"
                                    className={cn("h-5 px-2 bg-transparent text-[9px] font-bold", typeInfo.badgeClass)}
                                    style={{
                                        boxShadow: `0 0 8px ${typeInfo.glowColor}0.2)`,
                                    }}
                                >
                                    {getApiKeyNameById(agent.api_key_id)}
                                </Badge>
                            </div>
                        )}

                        {getTotalTools() > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-[#6272a4] font-black uppercase tracking-widest text-[9px]">Tools:</span>
                                <span className="text-[#f8f8f2]">{getTotalTools()}</span>
                            </div>
                        )}

                        {agent.config?.sub_agents && agent.config.sub_agents.length > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-[#6272a4] font-black uppercase tracking-widest text-[9px]">Sub-agents:</span>
                                <span className="text-[#f8f8f2]">{agent.config.sub_agents.length}</span>
                            </div>
                        )}

                        {agent.type === AgentType.WORKFLOW && agent.config?.workflow && (
                            <div className="flex justify-between items-center">
                                <span className="text-[#6272a4] font-black uppercase tracking-widest text-[9px]">Elements:</span>
                                <span className="text-[#f8f8f2]">
                                    {agent.config.workflow.nodes?.length || 0} nodes
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-[#1a1b26]">
                            <span className="text-[#6272a4] font-black uppercase tracking-widest text-[9px]">Created:</span>
                            <span className="text-[#6272a4]">{new Date(agent.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-[#1a1b26] mt-auto">
                    <a
                        href={agent.agent_card_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full py-3 transition-all hover:bg-[#1a1b26] text-[#6272a4] text-[9px] font-black uppercase tracking-widest group"
                        style={{
                            textShadow: '0 0 4px rgba(98,114,164,0.3)',
                        }}
                    >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        <span
                            className="group-hover:text-[#bd93f9] transition-colors"
                            style={{
                                textShadow: '0 0 8px rgba(189,147,249,0.0) group-hover:0 0 10px rgba(189,147,249,0.5)',
                            }}
                        >
                            Agent_Card
                        </span>
                        <ArrowRight className="h-3 w-3 ml-2" />
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
