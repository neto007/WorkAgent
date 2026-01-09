import { useEffect, useState } from "react";
import { useClient } from "@/contexts/ClientContext";
import { listAgents } from "@/services/agentService";
import type { Agent } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, Search, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import AgentFormDialog from "@/components/agents/dialogs/AgentFormDialog";
import { sanitizeAgentName, escapePromptBraces } from "@/lib/utils";
import type { MCPServer } from "@/types/mcpServer";
import { listMCPServers } from "@/services/mcpServerService";
// TODO: Re-enable when chat components are available
// import { AgentTestChatModal } from "./AgentTestChatModal";

export function AgentForm({
    selectedNode,
    handleUpdateNode
}: {
    selectedNode: any;
    handleUpdateNode: any;
}) {
    const { clientId } = useClient();
    const [node, setNode] = useState(selectedNode);
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog states
    const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
    const [availableMCPs, setAvailableMCPs] = useState<MCPServer[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newAgent, setNewAgent] = useState<Partial<Agent>>({
        client_id: clientId || "",
        name: "",
        description: "",
        type: "llm",
        model: "openai/gpt-4.1-nano",
        instruction: "",
        api_key_id: "",
        config: {
            tools: [],
            mcp_servers: [],
            custom_mcp_servers: [],
            custom_tools: { http_tools: [] },
            sub_agents: [],
            agent_tools: [],
        },
    });

    // TODO: Re-enable when chat components are available
    // const [testChatOpen, setTestChatOpen] = useState(false);

    useEffect(() => {
        if (selectedNode) {
            setNode(selectedNode);
        }
    }, [selectedNode]);

    useEffect(() => {
        if (!clientId) return;

        setLoading(true);
        const fetchData = async () => {
            try {
                const [agentsRes, mcpsRes] = await Promise.all([
                    listAgents(clientId, 0, 100),
                    listMCPServers()
                ]);
                setAgents(agentsRes.data);
                setAvailableMCPs(mcpsRes.data);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientId]);

    const filteredAgents = agents.filter((agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAgent = (agent: Agent) => {
        const updatedNode = {
            ...node,
            data: {
                ...node.data,
                agent,
                label: agent.name,
            },
        };
        setNode(updatedNode);
        handleUpdateNode(updatedNode);
    };

    const getAgentTypeName = (type: string) => {
        const agentTypes: Record<string, string> = {
            llm: "LLM",
            a2a: "A2A",
            sequential: "Sequential",
            parallel: "Parallel",
            loop: "Loop",
            workflow: "Workflow",
            task: "Task",
        };
        return agentTypes[type] || type;
        return agentTypes[type] || type;
    };

    const handleSaveAgent = async (agentData: Partial<Agent>) => {
        if (!clientId) return;
        setLoading(true);
        try {
            const sanitizedData = {
                ...agentData,
                client_id: clientId,
                name: agentData.name ? sanitizeAgentName(agentData.name) : agentData.name,
                instruction: agentData.instruction ? escapePromptBraces(agentData.instruction) : agentData.instruction
            };

            if (isEditMode && node.data.agent?.id) {
                // Update existing agent
                const { updateAgent } = await import("@/services/agentService");
                const updated = await updateAgent(node.data.agent.id, sanitizedData as any);

                // Refresh agent list
                const agentsRes = await listAgents(clientId, 0, 100);
                setAgents(agentsRes.data);

                if (updated.data) {
                    handleSelectAgent(updated.data);
                }
            } else {
                // Create new agent
                const { createAgent } = await import("@/services/agentService");
                const created = await createAgent(sanitizedData as any);

                // Refresh agent list
                const agentsRes = await listAgents(clientId, 0, 100);
                setAgents(agentsRes.data);

                if (created.data) {
                    handleSelectAgent(created.data);
                }
            }
            setIsAgentDialogOpen(false);
            setIsEditMode(false);
        } catch (error) {
            console.error("Error saving agent:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditAgent = () => {
        if (!node.data.agent) return;
        setNewAgent({ ...node.data.agent });
        setIsEditMode(true);
        setIsAgentDialogOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-[#0b0b11]">
            {/* Header */}
            <div className="p-4 border-b-2 border-[#1a1b26] flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                        Agent Configuration
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[#50fa7b] hover:text-[#50fa7b] hover:bg-[#50fa7b]/10"
                        onClick={() => {
                            setNewAgent({
                                client_id: clientId || "",
                                name: "",
                                description: "",
                                type: "llm",
                                model: "openai/gpt-4.1-nano",
                                instruction: "",
                                api_key_id: "",
                                config: {
                                    tools: [],
                                    mcp_servers: [],
                                    custom_mcp_servers: [],
                                    custom_tools: { http_tools: [] },
                                    sub_agents: [],
                                    agent_tools: [],
                                },
                            });
                            setIsEditMode(false);
                            setIsAgentDialogOpen(true);
                        }}
                    >
                        <Plus size={14} />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6272a4]" />
                    <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2] focus-visible:ring-[#bd93f9] focus-visible:border-[#bd93f9]"
                    />
                </div>
            </div>

            {/* Agent List */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {loading ? (
                        <div className="text-center py-8 text-[#6272a4]">Loading...</div>
                    ) : filteredAgents.length > 0 ? (
                        filteredAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${node.data.agent?.id === agent.id
                                    ? "bg-[#bd93f9]/10 border-[#bd93f9] shadow-[0_0_15px_rgba(189,147,249,0.3)]"
                                    : "bg-[#1a1b26] border-[#282a36] hover:border-[#bd93f9]/50"
                                    }`}
                                onClick={() => handleSelectAgent(agent)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-[#bd93f9]/20 rounded-full p-2 flex-shrink-0">
                                        <User size={16} className="text-[#bd93f9]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[#f8f8f2] truncate">{agent.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="text-[10px] bg-[#bd93f9]/20 text-[#bd93f9] border-[#bd93f9]/40">
                                                {getAgentTypeName(agent.type)}
                                            </Badge>
                                            {agent.model && (
                                                <span className="text-[10px] text-[#6272a4]">{agent.model}</span>
                                            )}
                                        </div>
                                        {agent.description && (
                                            <p className="text-xs text-[#6272a4] mt-1.5 line-clamp-2">
                                                {agent.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-[#6272a4]">
                            No agents found
                        </div>
                    )}
                </div>
            </ScrollArea>


            {/* Selected Agent */}
            {node.data.agent && (
                <div className="p-4 border-t-2 border-[#1a1b26] flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                            Selected
                        </h3>
                        <div className="flex gap-1">
                            {/* Edit Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-[#bd93f9] hover:text-[#bd93f9] hover:bg-[#bd93f9]/10"
                                onClick={handleEditAgent}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                </svg>
                            </Button>

                            {/* Test Button (Mock) */}
                            {/* 
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-[#50fa7b] hover:text-[#50fa7b] hover:bg-[#50fa7b]/10"
                                onClick={() => {}}
                            >
                                <PlayIcon size={14} />
                            </Button> 
                             */}

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-[#ff5555] hover:text-[#ff5555] hover:bg-[#ff5555]/10"
                                onClick={() => {
                                    handleUpdateNode({
                                        ...node,
                                        data: {
                                            ...node.data,
                                            agent: null,
                                            label: "Agent",
                                        },
                                    });
                                }}
                            >
                                <X size={14} />
                            </Button>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#bd93f9]/10 border-2 border-[#bd93f9]">
                        <div className="flex items-start gap-3">
                            <div className="bg-[#bd93f9]/20 rounded-full p-2">
                                <User size={16} className="text-[#bd93f9]" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-[#f8f8f2]">{node.data.agent.name}</h4>
                                <Badge className="text-[10px] bg-[#bd93f9]/20 text-[#bd93f9] border-[#bd93f9]/40 mt-1">
                                    {getAgentTypeName(node.data.agent.type)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAgentDialogOpen && (
                <AgentFormDialog
                    open={isAgentDialogOpen}
                    onClose={() => setIsAgentDialogOpen(false)}
                    onSubmit={handleSaveAgent}
                    agent={isEditMode ? newAgent as Agent : undefined}
                    mode={isEditMode ? 'edit' : 'create'}
                    availableMCPs={availableMCPs}
                />
            )}
        </div>
    );
}
