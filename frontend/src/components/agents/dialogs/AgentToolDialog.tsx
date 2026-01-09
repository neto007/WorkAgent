import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Agent } from "@/types/agent";
import { listAgents } from "@/services/agentService";
import { Search, X, Loader2 } from "lucide-react";
import { useClient } from "@/contexts/ClientContext";

interface AgentToolDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (tool: { id: string }) => void;
    currentAgentId?: string;
}

export function AgentToolDialog({
    open,
    onOpenChange,
    onSave,
    currentAgentId,
}: AgentToolDialogProps) {
    const { clientId } = useClient();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (open && clientId) {
            loadAgents();
        }
    }, [open, clientId]);

    const loadAgents = async () => {
        if (!clientId) return;
        setIsLoading(true);
        try {
            const res = await listAgents(clientId, 0, 100);
            // Filter out current agent
            const filtered = res.data.filter(a => a.id !== currentAgentId);
            setAgents(filtered);
        } catch (error) {
            console.error("Error loading agents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (agent: Agent) => {
        onSave({ id: agent.id });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] bg-[#0b0b11] border-[#1a1b26]">
                <DialogHeader className="border-b border-[#1a1b26] pb-4">
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(80,250,123,0.5)" }}>
                        Add_Agent_Tool
                    </DialogTitle>
                    <DialogDescription className="text-[#6272a4]">
                        Select an agent to use as a tool for this agent.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-[#6272a4]" />
                        <Input
                            placeholder="Search agents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-[#050101] border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#50fa7b] focus:ring-[#50fa7b]/20"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-3 text-[#6272a4] hover:text-[#f8f8f2]"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Agents List */}
                    {isLoading ? (
                        <div className="flex flex-col items-center py-12">
                            <Loader2 className="h-8 w-8 text-[#50fa7b] animate-spin mb-3" />
                            <p className="text-sm text-[#6272a4]">Loading agents...</p>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto space-y-2">
                            {filteredAgents.length === 0 ? (
                                <p className="text-center py-8 text-[#6272a4]">
                                    {search ? `No agents found matching "${search}"` : "No agents available"}
                                </p>
                            ) : (
                                filteredAgents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        onClick={() => handleSelect(agent)}
                                        className="flex items-center justify-between p-3 hover:bg-[#1a1b26] rounded-lg cursor-pointer border border-transparent hover:border-[#50fa7b]/30 transition-all"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="font-medium text-[#f8f8f2] truncate">{agent.name}</span>
                                            <Badge variant="outline" className="border-[#6272a4] text-[#8be9fd] text-[10px] uppercase shrink-0">
                                                {agent.type}
                                            </Badge>
                                        </div>
                                        <span className="text-[#50fa7b] text-xs font-bold">+ ADD</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-[#1a1b26] pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-transparent border-2 border-[#6272a4] text-[#6272a4] hover:bg-[#6272a4]/10"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
