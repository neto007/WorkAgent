import { Handle, type NodeProps, Position, useEdges } from "@xyflow/react";
import { User, Code, ExternalLink, Workflow, GitBranch, RefreshCw, BookOpenCheck, ArrowRight } from "lucide-react";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";

import { BaseNode } from "../../BaseNode";

export function AgentNode(props: NodeProps) {
    const { selected, data } = props;

    const edges = useEdges();

    const isHandleConnected = (handleId: string) => {
        return edges.some(
            (edge) => edge.source === props.id && edge.sourceHandle === handleId
        );
    };

    const isBottomHandleConnected = isHandleConnected("bottom-handle");

    const agent = data.agent as Agent | undefined;
    const isExecuting = data.isExecuting as boolean | undefined;

    const getAgentTypeName = (type: string) => {
        const agentTypes: Record<string, string> = {
            llm: "LLM Agent",
            a2a: "A2A Agent",
            sequential: "Sequential Agent",
            parallel: "Parallel Agent",
            loop: "Loop Agent",
            workflow: "Workflow Agent",
            task: "Task Agent",
        };
        return agentTypes[type] || type;
    };

    const getAgentTypeIcon = (type: string, colorHex: string) => {
        const iconProps = { className: "h-4 w-4", style: { color: colorHex } };
        switch (type) {
            case "llm":
                return <Code {...iconProps} />;
            case "a2a":
                return <ExternalLink {...iconProps} />;
            case "sequential":
                return <Workflow {...iconProps} />;
            case "parallel":
                return <GitBranch {...iconProps} />;
            case "loop":
                return <RefreshCw {...iconProps} />;
            case "workflow":
                return <Workflow {...iconProps} />;
            case "task":
                return <BookOpenCheck {...iconProps} />;
            default:
                return <User {...iconProps} />;
        }
    };

    const getAgentColorInfo = (type: string) => {
        switch (type) {
            case "llm":
                return { key: "green", hex: "#00ff7f", bg: "bg-[#00ff7f]/20", border: "border-[#00ff7f]/30", text: "text-[#00ff7f]" };
            case "a2a":
                return { key: "purple", hex: "#bd93f9", bg: "bg-[#bd93f9]/20", border: "border-[#bd93f9]/30", text: "text-[#bd93f9]" };
            case "sequential":
                return { key: "yellow", hex: "#f1fa8c", bg: "bg-[#f1fa8c]/20", border: "border-[#f1fa8c]/30", text: "text-[#f1fa8c]" };
            case "parallel":
                return { key: "pink", hex: "#ff79c6", bg: "bg-[#ff79c6]/20", border: "border-[#ff79c6]/30", text: "text-[#ff79c6]" };
            case "loop":
                return { key: "orange", hex: "#ffb86c", bg: "bg-[#ffb86c]/20", border: "border-[#ffb86c]/30", text: "text-[#ffb86c]" };
            case "workflow":
                return { key: "cyan", hex: "#8be9fd", bg: "bg-[#8be9fd]/20", border: "border-[#8be9fd]/30", text: "text-[#8be9fd]" };
            case "task":
                return { key: "red", hex: "#ff5555", bg: "bg-[#ff5555]/20", border: "border-[#ff5555]/30", text: "text-[#ff5555]" };
            default:
                return { key: "blue", hex: "#6272a4", bg: "bg-[#6272a4]/20", border: "border-[#6272a4]/30", text: "text-[#6272a4]" };
        }
    };

    const getModelBadgeColor = (colorInfo: ReturnType<typeof getAgentColorInfo>) => {
        return `${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`;
    };

    const colorInfo = agent ? getAgentColorInfo(agent.type) : getAgentColorInfo("default");

    // Simple Badge wrapper to avoid import conflicts or use the UI one
    const CustomBadge = ({ className, children }: any) => (
        <div className={cn("px-2 py-0.5 rounded-md text-xs font-medium border", className)}>
            {children}
        </div>
    );

    return (
        <BaseNode hasTarget={true} selected={selected || false} borderColor={colorInfo.key} isExecuting={isExecuting}>
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm overflow-hidden"
                        style={{
                            backgroundColor: agent?.avatar_url ? 'transparent' : `${colorInfo.hex}33`
                        }}
                    >
                        {agent?.avatar_url ? (
                            <img
                                src={agent.avatar_url}
                                alt={agent.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    // Fallback para ícone se a imagem falhar ao carregar
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        parent.style.backgroundColor = `${colorInfo.hex}33`;
                                        // Create a User icon element
                                        const userIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                        userIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                                        userIcon.setAttribute('width', '24');
                                        userIcon.setAttribute('height', '24');
                                        userIcon.setAttribute('viewBox', '0 0 24 24');
                                        userIcon.setAttribute('fill', 'none');
                                        userIcon.setAttribute('stroke', 'currentColor');
                                        userIcon.setAttribute('stroke-width', '2');
                                        userIcon.setAttribute('stroke-linecap', 'round');
                                        userIcon.setAttribute('stroke-linejoin', 'round');
                                        userIcon.setAttribute('class', 'lucide lucide-user h-5 w-5');
                                        userIcon.style.color = colorInfo.hex;
                                        userIcon.innerHTML = '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';

                                        // Clear existing content and append the icon
                                        parent.innerHTML = '';
                                        parent.appendChild(userIcon);
                                    }
                                }}
                            />
                        ) : (
                            <User className="h-5 w-5" style={{ color: colorInfo.hex }} />
                        )}
                    </div>
                    <div>
                        <p className="text-lg font-medium" style={{ color: colorInfo.hex }}>
                            {data.label as string}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-1 rounded-md bg-[#282a36] px-2 py-1 relative">
                    <span className="text-xs font-medium text-[#f8f8f2]">Next step</span>
                    <ArrowRight className="h-3.5 w-3.5" style={{ color: colorInfo.hex }} />
                    {/* Invisible Handle overlaying the arrow area for better UX */}
                    <Handle
                        type="source"
                        position={Position.Right}
                        className="!w-full !h-full !opacity-0 !rounded-none !border-0 !bg-transparent absolute top-0 left-0"
                        style={{
                            zIndex: 10,
                            cursor: "pointer",
                        }}
                        id="bottom-handle" // Added id to the new handle
                    />
                </div>
            </div>

            {agent ? (
                <div
                    className="mb-3 rounded-lg border p-3 transition-all duration-200"
                    style={{
                        backgroundColor: `${colorInfo.hex}1a`, // 10% opacity
                        borderColor: `${colorInfo.hex}66`, // 40% opacity
                    }}
                >
                    <div className="flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center">
                                {getAgentTypeIcon(agent.type, colorInfo.hex)}
                                <span className="ml-1.5 font-medium text-[#f8f8f2]">{agent.name}</span>
                            </div>
                            <CustomBadge
                                className={cn(colorInfo.bg, colorInfo.text, colorInfo.border)}
                            >
                                {getAgentTypeName(agent.type)}
                            </CustomBadge>
                        </div>

                        {agent.model && (
                            <div className="mt-2 flex items-center">
                                <CustomBadge
                                    className={cn(getModelBadgeColor(colorInfo))}
                                >
                                    {agent.model}
                                </CustomBadge>
                            </div>
                        )}

                        {agent.description && (
                            <p className="mt-2 text-xs text-[#6272a4] line-clamp-2">
                                {agent.description.slice(0, 30)} {agent.description.length > 30 && '...'}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="mb-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#bd93f9]/40 bg-[#bd93f9]/10 p-5 text-center transition-all duration-200 hover:border-[#bd93f9]/60 hover:bg-[#bd93f9]/20">
                    <User className="h-8 w-8 text-[#bd93f9]/50 mb-2" />
                    <p className="text-[#bd93f9]">Select an agent</p>
                    <p className="mt-1 text-xs text-[#6272a4]">Click to configure</p>
                </div>
            )}

            <div className="mt-2 flex items-center justify-end text-sm text-[#6272a4] transition-colors">
                <div className="flex items-center space-x-1 rounded-md py-1 px-2">
                    <span>Next step</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <Handle
                    className={cn(
                        "!w-3 !h-3 !rounded-full transition-all duration-300",
                        isBottomHandleConnected
                            ? `!bg-[${colorInfo.hex}] !border-[${colorInfo.hex}]`
                            : "!bg-[#6272a4] !border-[#6272a4]",
                        selected && isBottomHandleConnected && `!bg-[${colorInfo.hex}] !border-[${colorInfo.hex}]`
                    )}
                    style={{
                        position: "absolute",
                        right: "-8px",
                        top: "calc(100% - 25px)",
                        backgroundColor: isBottomHandleConnected ? colorInfo.hex : undefined,
                        borderColor: isBottomHandleConnected ? colorInfo.hex : undefined,
                        boxShadow: isBottomHandleConnected ? `0 0 10px ${colorInfo.hex}` : undefined
                    }}
                    type="source"
                    position={Position.Right}
                    id="bottom-handle"
                />
            </div>
        </BaseNode>
    );
}
