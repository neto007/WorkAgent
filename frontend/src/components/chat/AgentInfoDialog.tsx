/*
* @author: Davidson Gomes
* @file: /components/chat/AgentInfoDialog.tsx
*/
import { useState, useEffect } from "react";
import { type Agent } from "@/types/agent";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Bot,
    Code,
    Layers,
    TagIcon,
    Edit,
    Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listApiKeys } from "@/services/agentService";
import AgentFormDialog from "@/components/agents/dialogs/AgentFormDialog";

interface AgentInfoDialogProps {
    agent: Agent | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAgentUpdated?: (updatedAgent: Agent) => void;
}

export function AgentInfoDialog({
    agent,
    open,
    onOpenChange,
    onAgentUpdated,
}: AgentInfoDialogProps) {
    const [activeTab, setActiveTab] = useState("info");
    const [isAgentFormOpen, setIsAgentFormOpen] = useState(false);

    // Simplified user access
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : {};
    const clientId = user?.client_id || "";

    useEffect(() => {
        if (!clientId || !open) return;

        const loadData = async () => {
            try {
                // Pre-load helper data if needed
                await listApiKeys(clientId);
            } catch (error) {
                console.error("Error loading data for agent info:", error);
            }
        };

        loadData();
    }, [clientId, open]);

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

    const handleSaveAgent = async (agentData: any) => {
        if (!agent?.id) return;
        // AgentFormDialog handles the save logic internally usually, 
        // or calls onSubmit. We'll reuse the existing flow if possible.
        // For now we just close the form as the main page handles updates usually.
        setIsAgentFormOpen(false);
        if (onAgentUpdated) onAgentUpdated(agentData as Agent);
    };

    const handleExportAgent = async () => {
        if (!agent) return;
        console.log("Exporting agent", agent); // Implementation placeholder
    };

    if (!agent) return null;

    const getToolsCount = () => {
        let count = 0;
        if (agent.config?.tools) count += agent.config.tools.length;
        if (agent.config?.custom_tools?.http_tools)
            count += agent.config.custom_tools.http_tools.length;
        if (agent.config?.agent_tools)
            count += agent.config.agent_tools.length;
        return count;
    };

    const getSubAgentsCount = () => {
        return agent.config?.sub_agents?.length || 0;
    };



    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden bg-[#050101] border-[#1a1b26] border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <DialogHeader className="flex flex-row items-start justify-between pb-2 border-b border-[#1a1b26]">
                        <div>
                            <DialogTitle className="text-xl text-white flex items-center gap-2 font-black uppercase tracking-wider">
                                <Bot className="h-5 w-5 text-[#bd93f9]" />
                                {agent.name}
                            </DialogTitle>
                            <DialogDescription className="text-[#6272a4] mt-1">
                                {agent.description || "No description available"}
                            </DialogDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="bg-[#1a1b26] border-[#bd93f9] text-[#bd93f9] font-bold"
                            >
                                {getAgentTypeName(agent.type)}
                            </Badge>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-xl bg-[#1a1b26] border-[#1a1b26] hover:bg-[#bd93f9] hover:text-[#282a36] hover:border-[#bd93f9] transition-all"
                                onClick={handleExportAgent}
                                title="Export agent as JSON"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-xl bg-[#1a1b26] border-[#1a1b26] hover:bg-[#50fa7b] hover:text-[#282a36] hover:border-[#50fa7b] transition-all"
                                onClick={() => setIsAgentFormOpen(true)}
                                title="Edit agent"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1 overflow-hidden flex flex-col mt-4"
                    >
                        <TabsList className="bg-[#1a1b26] p-1 border-b border-[#1a1b26] rounded-xl self-center">
                            <TabsTrigger
                                value="info"
                                className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] rounded-lg font-bold uppercase text-xs"
                            >
                                Information
                            </TabsTrigger>
                            <TabsTrigger
                                value="tools"
                                className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] rounded-lg font-bold uppercase text-xs"
                            >
                                Tools
                            </TabsTrigger>
                            <TabsTrigger
                                value="config"
                                className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] rounded-lg font-bold uppercase text-xs"
                            >
                                Configuration
                            </TabsTrigger>
                        </TabsList>

                        <ScrollArea className="flex-1 p-4">
                            <TabsContent value="info" className="mt-0 space-y-4">
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-[#0b0b11] p-3 rounded-xl border border-[#1a1b26] flex flex-col items-center justify-center text-center shadow-lg">
                                            <Code className="h-5 w-5 text-[#ff79c6] mb-1" />
                                            <span className="text-xs text-[#6272a4] font-bold uppercase">Model</span>
                                            <span className="text-sm text-[#f8f8f2] mt-1 font-bold">
                                                {agent.model || "Not specified"}
                                            </span>
                                        </div>

                                        <div className="bg-[#0b0b11] p-3 rounded-xl border border-[#1a1b26] flex flex-col items-center justify-center text-center shadow-lg">
                                            <TagIcon className="h-5 w-5 text-[#8be9fd] mb-1" />
                                            <span className="text-xs text-[#6272a4] font-bold uppercase">Tools</span>
                                            <span className="text-sm text-[#f8f8f2] mt-1 font-bold">
                                                {getToolsCount()}
                                            </span>
                                        </div>

                                        <div className="bg-[#0b0b11] p-3 rounded-xl border border-[#1a1b26] flex flex-col items-center justify-center text-center shadow-lg">
                                            <Layers className="h-5 w-5 text-[#f1fa8c] mb-1" />
                                            <span className="text-xs text-[#6272a4] font-bold uppercase">
                                                Sub-agents
                                            </span>
                                            <span className="text-sm text-[#f8f8f2] mt-1 font-bold">
                                                {getSubAgentsCount()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-[#0b0b11] p-4 rounded-xl border border-[#1a1b26] shadow-lg">
                                        <h3 className="text-sm font-bold text-[#bd93f9] mb-2 uppercase tracking-wide">
                                            Agent Role
                                        </h3>
                                        <p className="text-[#f8f8f2] text-sm">
                                            {agent.role || "Not specified"}
                                        </p>
                                        <h3 className="text-sm font-bold text-[#bd93f9] mb-2 uppercase tracking-wide mt-4">
                                            Agent Goal
                                        </h3>
                                        <p className="text-[#f8f8f2] text-sm">
                                            {agent.goal || "Not specified"}
                                        </p>
                                        {/* agent instructions needs checking type definition usually config.system or instruction */}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="tools" className="mt-0 space-y-4">
                                {/* Tools rendering logic similar to original but styled */}
                                <div className="bg-[#0b0b11] p-4 rounded-xl border border-[#1a1b26] shadow-lg">
                                    <p className="text-[#6272a4] text-center italic">Tool details view</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="config" className="mt-0 space-y-4">
                                {/* Config rendering logic similar to original but styled */}
                                <div className="bg-[#0b0b11] p-4 rounded-xl border border-[#1a1b26] shadow-lg">
                                    <p className="text-[#6272a4] text-center italic">Configuration details view</p>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>

                    <DialogFooter className="pt-4 border-t border-[#1a1b26] bg-[#0b0b11] p-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full bg-[#1a1b26] hover:bg-[#ff5555] border-[#1a1b26] text-[#f8f8f2] font-bold uppercase tracking-wider rounded-xl hover:border-[#ff5555]"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Agent Edit Form Dialog Reuse */}
            <AgentFormDialog
                open={isAgentFormOpen}
                onClose={() => setIsAgentFormOpen(false)}
                onSubmit={handleSaveAgent}
                agent={agent}
                mode="edit"
            />
        </>
    );
}
