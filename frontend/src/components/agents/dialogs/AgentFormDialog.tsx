import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Agent } from "@/types/agent";
import { AgentType } from "@/types/agent";
import type { MCPServer } from "@/types/mcpServer";
import { BasicInfoTab } from "../tabs/BasicInfoTab";
import { ConfigurationTab } from "../tabs/ConfigurationTab";
import { SubAgentsTab } from "../tabs/SubAgentsTab";
import { TaskAgentConfig } from "../tabs/TaskAgentConfig";
import { listAgents, listApiKeys } from "@/services/agentService";
import type { ApiKey } from "@/services/agentService";
import { useClient } from "@/contexts/ClientContext";

interface AgentFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    agent?: Agent;
    mode?: 'create' | 'edit';
    availableMCPs?: MCPServer[];
}

export default function AgentFormDialog({
    open,
    onClose,
    onSubmit,
    agent,
    mode = 'create',
    availableMCPs: providedMCPs
}: AgentFormDialogProps) {
    const { clientId } = useClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [values, setValues] = useState<Partial<Agent>>(agent || {
        type: AgentType.LLM,
        model: 'openai/gpt-4o',
        config: { temperature: 0.7 }
    });
    const [activeTab, setActiveTab] = useState("basic");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Data for Configuration tab
    const [agents, setAgents] = useState<Agent[]>([]);
    const [availableMCPs, setAvailableMCPs] = useState<MCPServer[]>(providedMCPs || []);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

    useEffect(() => {
        if (open) {
            setValues(agent || {
                type: AgentType.LLM,
                model: 'openai/gpt-4o',
                config: { temperature: 0.7 }
            });
            setActiveTab("basic");
            setErrors({});
            loadData();
        }
    }, [open]);

    useEffect(() => {
        if (providedMCPs) {
            setAvailableMCPs(providedMCPs);
        }
    }, [providedMCPs]);

    const loadData = async () => {
        if (!clientId) return;

        try {
            // Load agents for Agent Tools
            const agentsRes = await listAgents(clientId, 0, 100);
            setAgents(agentsRes.data);

            if (!providedMCPs) {
                const { listMCPServers } = await import("@/services/mcpServerService");
                const mcpsRes = await listMCPServers();
                setAvailableMCPs(mcpsRes.data);
            }

            // Load API Keys
            const apiKeysRes = await listApiKeys(clientId);
            setApiKeys(apiKeysRes.data);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };


    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!values.name?.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!values.type) {
            newErrors.type = 'Agent type is required';
        }

        if (values.type === 'llm' && !values.model) {
            newErrors.model = 'Model is required for LLM agents';
        }

        // Validate TASK agents have at least one task configured
        if (values.type === 'task') {
            if (!values.config?.tasks || values.config.tasks.length === 0) {
                newErrors.tasks = 'At least one task is required for TASK agents';
            } else {
                // Validate each task has required fields
                for (let i = 0; i < values.config.tasks.length; i++) {
                    const task = values.config.tasks[i];
                    if (!task.agent_id) {
                        newErrors[`task_${i}`] = `Task ${i + 1}: Agent is required`;
                    }
                    if (!task.description?.trim()) {
                        newErrors[`task_${i}`] = `Task ${i + 1}: Description is required`;
                    }
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async () => {
        if (!validateForm()) {
            // Check if it's a task validation error
            const hasTaskError = values.type === 'task' && (!values.config?.tasks || values.config.tasks.length === 0);

            if (hasTaskError) {
                setActiveTab('tasks'); // Redirect to tasks tab to show error
            } else {
                setActiveTab("basic"); // Go back to Basic tab for other validation failures
            }
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare data for submission
            const submitData = {
                ...values,
                // Convert empty strings to null for UUID fields to avoid PostgreSQL errors
                api_key_id: values.api_key_id === '' ? null : values.api_key_id,
                folder_id: values.folder_id === '' ? null : values.folder_id,
                // Ensure temperature is properly set
                temperature: values.config?.temperature ?? 0.7,
            };

            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[85vh] bg-[#0b0b11] border-[#1a1b26] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-0">
                {/* Header */}
                <DialogHeader className="border-b border-[#1a1b26] px-6 py-4">
                    <DialogTitle
                        className="text-2xl font-black text-white uppercase tracking-widest"
                        style={{ textShadow: "0 0 10px rgba(189,147,249,0.5)" }}
                    >
                        {mode === 'edit' ? 'Edit_Agent' : 'New_Agent'}
                    </DialogTitle>
                    <DialogDescription className="text-[#6272a4] text-xs font-mono uppercase tracking-widest mt-1">
                        Configure the parameters and architecture of your AI agent.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex-1 flex flex-col overflow-hidden">
                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-4">
                            <TabsList className={`grid w-full ${values.type === 'task' ? 'grid-cols-4' : 'grid-cols-3'} bg-[#1a1b26] border border-[#6272a4]`}>
                                <TabsTrigger value="basic" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] font-black uppercase tracking-wider">Basic</TabsTrigger>
                                <TabsTrigger value="config" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] font-black uppercase tracking-wider">Config</TabsTrigger>
                                {values.type === 'task' && (
                                    <TabsTrigger value="tasks" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] font-black uppercase tracking-wider">Tasks</TabsTrigger>
                                )}
                                <TabsTrigger value="subagents" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] font-black uppercase tracking-wider">Sub-Agents</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 px-6">
                            <TabsContent value="basic" className="py-4 mt-0">
                                <BasicInfoTab
                                    values={values}
                                    onChange={setValues}
                                    errors={errors}
                                    isSubmitting={isSubmitting}
                                    apiKeys={apiKeys}
                                />
                            </TabsContent>

                            <TabsContent value="config" className="py-4 mt-0">
                                <ConfigurationTab
                                    values={values}
                                    onChange={setValues}
                                    isSubmitting={isSubmitting}
                                    availableMCPs={availableMCPs}
                                    agents={agents}
                                />
                            </TabsContent>

                            {values.type === 'task' && (
                                <TabsContent value="tasks" className="py-4 mt-0">
                                    <TaskAgentConfig
                                        values={values}
                                        onChange={setValues}
                                        agents={agents}
                                        getAgentNameById={(id) => agents.find(a => a.id === id)?.name || id}
                                        singleTask={false}
                                        errors={errors}
                                    />
                                </TabsContent>
                            )}

                            <TabsContent value="subagents" className="py-4 mt-0">
                                <SubAgentsTab
                                    values={values}
                                    onChange={setValues}
                                    isSubmitting={isSubmitting}
                                />
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>

                    {/* Footer */}
                    <DialogFooter className="border-t-2 border-[#1a1b26] px-6 py-4 flex-row gap-3 justify-end bg-[#0b0b11]">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="bg-transparent text-[#ff5555] font-black uppercase tracking-wider border-2 border-[#ff5555] border-b-4 hover:bg-[#ff5555]/10 active:border-b-2 active:translate-y-1 transition-all h-11 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all h-11 rounded-xl"
                        >
                            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent >
        </Dialog >
    );
}
