import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Agent } from "@/types/agent";
import { listAgents } from "@/services/agentService";
import { Loader2, Search, X } from "lucide-react";
import { useClient } from "@/contexts/ClientContext";

interface SubAgentsTabProps {
    values: Partial<Agent>;
    onChange: (values: Partial<Agent>) => void;
    isSubmitting?: boolean;
}

export function SubAgentsTab({ values, onChange, isSubmitting = false }: SubAgentsTabProps) {
    const { clientId } = useClient();
    const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadAgents();
    }, [clientId]);

    const loadAgents = async () => {
        if (!clientId) return;

        setIsLoading(true);
        try {
            const res = await listAgents(clientId, 0, 100);
            // Filter out the current agent to avoid self-reference
            const filteredAgents = res.data.filter(agent => agent.id !== values.id);
            setAvailableAgents(filteredAgents);
        } catch (error) {
            console.error("Error loading agents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSubAgent = (agentId: string) => {
        if (!values.config?.sub_agents?.includes(agentId)) {
            onChange({
                ...values,
                config: {
                    ...values.config,
                    sub_agents: [...(values.config?.sub_agents || []), agentId],
                },
            });
        }
    };

    const handleRemoveSubAgent = (agentId: string) => {
        onChange({
            ...values,
            config: {
                ...values.config,
                sub_agents: values.config?.sub_agents?.filter((id) => id !== agentId) || [],
            },
        });
    };

    const getAgentNameById = (id: string) => {
        return availableAgents.find(a => a.id === id)?.name || id;
    };

    const filteredAgents = availableAgents.filter(agent =>
        agent.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider" style={{ textShadow: "0 0 10px rgba(80,250,123,0.5)" }}>
                    Sub-Agents
                </h3>
                <div className="text-sm text-[#6272a4] font-mono">
                    {values.config?.sub_agents?.length || 0} selected
                </div>
            </div>

            {/* Main Container */}
            <div className="border border-[#1a1b26] rounded-lg p-6 bg-[#0b0b11]">
                <p className="text-sm text-[#6272a4] mb-6">
                    Select agents that will be used as sub-agents for hierarchical orchestration.
                </p>

                {/* Selected Sub-Agents */}
                {values.config?.sub_agents && values.config.sub_agents.length > 0 ? (
                    <div className="space-y-3 mb-6">
                        <h4 className="text-sm font-bold text-[#50fa7b] uppercase tracking-wider">
                            Selected Sub-Agents:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {values.config.sub_agents.map((agentId) => (
                                <Badge
                                    key={agentId}
                                    className="flex items-center gap-2 bg-[#50fa7b]/10 text-[#50fa7b] border border-[#50fa7b]/30 px-3 py-1.5"
                                >
                                    {getAgentNameById(agentId)}
                                    <button
                                        onClick={() => handleRemoveSubAgent(agentId)}
                                        disabled={isSubmitting}
                                        className="ml-1 h-4 w-4 rounded-full hover:bg-[#50fa7b]/20 inline-flex items-center justify-center transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 mb-6 border border-dashed border-[#1a1b26] rounded-lg">
                        <p className="text-[#6272a4] text-sm">No sub-agents selected yet</p>
                    </div>
                )}

                {/* Available Agents */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#bd93f9] uppercase tracking-wider">
                        Available Agents:
                    </h4>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-[#6272a4]" />
                        <Input
                            placeholder="Search agents by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            disabled={isSubmitting}
                            className="pl-10 bg-[#050101] border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#bd93f9] focus:ring-[#bd93f9]/20"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-3 text-[#6272a4] hover:text-[#f8f8f2] transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Agents List */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-[#bd93f9] animate-spin mb-3" />
                            <div className="text-sm text-[#6272a4] uppercase tracking-wider">Loading agents...</div>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {filteredAgents.length === 0 ? (
                                <div className="text-center py-8 text-[#6272a4]">
                                    {search ? `No agents found matching "${search}"` : "No other agents available"}
                                </div>
                            ) : (
                                filteredAgents.map((agent) => {
                                    const isSelected = values.config?.sub_agents?.includes(agent.id);
                                    return (
                                        <div
                                            key={agent.id}
                                            className="flex items-center justify-between p-3 hover:bg-[#1a1b26] rounded-lg transition-colors border border-transparent hover:border-[#282a36]"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="font-medium text-[#f8f8f2] truncate">{agent.name}</span>
                                                <Badge
                                                    variant="outline"
                                                    className="border-[#6272a4] text-[#8be9fd] text-[10px] uppercase tracking-wider shrink-0"
                                                >
                                                    {agent.type}
                                                </Badge>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleAddSubAgent(agent.id)}
                                                disabled={isSelected || isSubmitting}
                                                className={isSelected
                                                    ? "text-[#6272a4] bg-[#1a1b26] cursor-not-allowed"
                                                    : "text-[#50fa7b] hover:bg-[#50fa7b]/10 hover:text-[#50fa7b] border border-[#50fa7b]/30"
                                                }
                                            >
                                                {isSelected ? "✓ Added" : "+ Add"}
                                            </Button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
