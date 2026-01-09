import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentType } from "@/types/agent";
import type { Agent } from "@/types/agent";
import type { MCPServer } from "@/types/mcpServer";
import {
    Check,
    Copy,
    Eye,
    EyeOff,
    Plus,
    Settings,
    X,
    GitBranch,
} from "lucide-react";
import { useState } from "react";
import { MCPDialog } from "../dialogs/MCPDialog";
import { CustomMCPDialog } from "../dialogs/CustomMCPDialog";
import { AgentToolDialog } from "../dialogs/AgentToolDialog";
import { CustomToolDialog } from "../dialogs/CustomToolDialog";
import { A2AAgentConfig } from "../config/A2AAgentConfig";
import { SequentialAgentConfig } from "../config/SequentialAgentConfig";
import { ParallelAgentConfig } from "../config/ParallelAgentConfig";
import { LoopAgentConfig } from "../config/LoopAgentConfig";

interface ConfigurationTabProps {
    values: Partial<Agent>;
    onChange: (values: Partial<Agent>) => void;
    isSubmitting?: boolean;
    availableMCPs: MCPServer[];
    agents: Agent[];
}

export function ConfigurationTab({
    values,
    onChange,
    availableMCPs = [],
    agents = []
}: ConfigurationTabProps) {
    const [agentToolDialogOpen, setAgentToolDialogOpen] = useState(false);
    const [customToolDialogOpen, setCustomToolDialogOpen] = useState(false);
    const [editingCustomTool, setEditingCustomTool] = useState<any>(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedCardUrl, setCopiedCardUrl] = useState(false);

    // Dialog states for MCP
    const [mcpDialogOpen, setMcpDialogOpen] = useState(false);
    const [customMcpDialogOpen, setCustomMcpDialogOpen] = useState(false);
    const [selectedMCP, setSelectedMCP] = useState<any>(null);

    const handleOpenMCPDialog = (mcpConfig: any = null) => {
        setSelectedMCP(mcpConfig);
        setMcpDialogOpen(true);
    };

    const handleSaveMCP = (mcpConfig: any) => {
        const currentMcpServers = values.config?.mcp_servers || [];
        const existingIndex = currentMcpServers.findIndex(
            (mcp) => mcp.id === mcpConfig.id
        );

        let updatedMcpServers;
        if (existingIndex >= 0) {
            updatedMcpServers = [...currentMcpServers];
            updatedMcpServers[existingIndex] = mcpConfig;
        } else {
            updatedMcpServers = [...currentMcpServers, mcpConfig];
        }

        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                mcp_servers: updatedMcpServers,
            },
        });
    };

    const handleRemoveMCP = (mcpId: string) => {
        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                mcp_servers: (values.config?.mcp_servers || []).filter(
                    (mcp) => mcp.id !== mcpId
                ),
            },
        });
    };

    const handleSaveCustomMCP = (customMCP: any) => {
        const currentCustomMcps = values.config?.custom_mcp_servers || [];
        const existingIndex = currentCustomMcps.findIndex(
            (mcp) => mcp.url === customMCP.url
        );

        let updatedCustomMcps;
        if (existingIndex >= 0) {
            updatedCustomMcps = [...currentCustomMcps];
            updatedCustomMcps[existingIndex] = customMCP;
        } else {
            updatedCustomMcps = [...currentCustomMcps, customMCP];
        }

        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                custom_mcp_servers: updatedCustomMcps,
            },
        });
    };

    const handleRemoveCustomMCP = (url: string) => {
        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                custom_mcp_servers: (values.config?.custom_mcp_servers || []).filter(
                    (mcp) => mcp.url !== url
                ),
            },
        });
    };

    const handleAddAgentTool = (tool: { id: string }) => {
        const updatedAgentTools = [...(values.config?.agent_tools || [])];
        if (!updatedAgentTools.includes(tool.id)) {
            updatedAgentTools.push(tool.id);
            onChange({
                ...values,
                config: {
                    ...(values.config || {}),
                    agent_tools: updatedAgentTools,
                },
            });
        }
    };

    const handleRemoveAgentTool = (id: string) => {
        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                agent_tools: (values.config?.agent_tools || []).filter(
                    (toolId) => toolId !== id
                ),
            },
        });
    };

    const handleSaveCustomTool = (tool: any) => {
        const currentTools = values.config?.custom_tools?.http_tools || [];
        let updatedTools;

        if (editingCustomTool && typeof editingCustomTool.idx === "number") {
            updatedTools = [...currentTools];
            updatedTools[editingCustomTool.idx] = tool;
        } else {
            updatedTools = [...currentTools, tool];
        }

        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                custom_tools: {
                    ...(values.config?.custom_tools || { http_tools: [] }),
                    http_tools: updatedTools,
                },
            },
        });
        setEditingCustomTool(null);
    };

    const handleRemoveCustomTool = (idx: number) => {
        const updatedTools = [...(values.config?.custom_tools?.http_tools || [])];
        updatedTools.splice(idx, 1);
        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                custom_tools: {
                    ...(values.config?.custom_tools || { http_tools: [] }),
                    http_tools: updatedTools,
                },
            },
        });
    };

    const handleEditCustomTool = (tool: any, idx: number) => {
        setEditingCustomTool({ ...tool, idx });
        setCustomToolDialogOpen(true);
    };

    const getAgentNameById = (id: string) => {
        return agents.find((a) => a.id === id)?.name || id;
    };

    const credentialsSection = (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(189,147,249,0.5)" }}>
                Credentials & URLs
            </h3>
            <div className="border border-[#1a1b26] rounded-lg p-6 bg-[#0b0b11] space-y-4">
                <div className="space-y-2">
                    <label className="text-xs text-[#6272a4] font-bold uppercase tracking-wider" htmlFor="agent-card-url">
                        Agent Card URL
                    </label>
                    <div className="relative flex items-center">
                        <input
                            id="agent-card-url"
                            type="text"
                            className="w-full bg-[#050101] border border-[#1a1b26] rounded-md px-4 py-2 text-[#f8f8f2] pr-12 focus:outline-none focus:border-[#bd93f9]/50 transition-colors"
                            value={values.agent_card_url || ""}
                            readOnly
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            className="absolute right-3 text-[#6272a4] hover:text-[#bd93f9] transition-colors"
                            onClick={async () => {
                                if (values.agent_card_url) {
                                    await navigator.clipboard.writeText(values.agent_card_url);
                                    setCopiedCardUrl(true);
                                    setTimeout(() => setCopiedCardUrl(false), 2000);
                                }
                            }}
                        >
                            {copiedCardUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-[#6272a4] font-bold uppercase tracking-wider" htmlFor="agent-api-key">
                        API Key & Auth Token
                    </label>
                    <div className="relative flex items-center">
                        <input
                            id="agent-api-key"
                            type={showApiKey ? "text" : "password"}
                            className="w-full bg-[#050101] border border-[#1a1b26] rounded-md px-4 py-2 text-[#f8f8f2] pr-24 focus:outline-none focus:border-[#bd93f9]/50 transition-colors"
                            value={values.config?.api_key || ""}
                            onChange={(e) =>
                                onChange({
                                    ...values,
                                    config: {
                                        ...(values.config || {}),
                                        api_key: e.target.value,
                                    },
                                })
                            }
                            placeholder="Enter_API_Key_Secret..."
                            autoComplete="new-password"
                        />
                        {/* Hidden username field to satisfy browser autocomplete heuristics */}
                        <input type="text" name="username" autoComplete="username" style={{ display: 'none' }} />
                        <div className="absolute right-3 flex items-center gap-2">
                            <button
                                type="button"
                                className="p-1 text-[#6272a4] hover:text-[#bd93f9] transition-colors"
                                onClick={() => setShowApiKey(!showApiKey)}
                            >
                                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                type="button"
                                className="p-1 text-[#6272a4] hover:text-[#bd93f9] transition-colors"
                                onClick={async () => {
                                    if (values.config?.api_key) {
                                        await navigator.clipboard.writeText(values.config.api_key);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }
                                }}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Agent Specific Content
    const renderSpecificConfig = () => {
        switch (values.type) {
            case AgentType.LLM:
                return (
                    <>
                        {/* MCP Servers Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(139,233,253,0.5)" }}>
                                    Standard MCP Servers
                                </h3>
                                <Badge className="bg-[#8be9fd]/10 text-[#8be9fd] border-[#8be9fd]/30">Native_Stack</Badge>
                            </div>
                            <div className="border border-[#1a1b26] rounded-lg p-6 bg-[#0b0b11] space-y-4">
                                {values.config?.mcp_servers && values.config.mcp_servers.length > 0 ? (
                                    <div className="space-y-3">
                                        {values.config.mcp_servers.map((mcp) => (
                                            <div key={mcp.id} className="flex items-center justify-between p-3 bg-[#050101] rounded-lg border border-[#1a1b26] group hover:border-[#8be9fd]/50 transition-all">
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-bold text-[#f8f8f2] text-sm truncate block">{availableMCPs.find(a => a.id === mcp.id)?.name || mcp.id}</span>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {(mcp.tools || []).map(toolId => (
                                                            <Badge key={toolId} variant="outline" className="text-[10px] border-[#8be9fd]/20 text-[#8be9fd]/70 py-0 h-4">
                                                                {toolId}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" type="button" onClick={() => handleRemoveMCP(mcp.id)} className="text-[#ff5555] hover:bg-[#ff5555]/10 h-8 w-8 p-0">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border border-dashed border-[#1a1b26] rounded-lg bg-[#050101]/50">
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    onClick={() => handleOpenMCPDialog()}
                                    className="w-full bg-[#8be9fd] hover:bg-[#8be9fd] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#41a0b3] hover:border-[#41a0b3] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Hook New Server
                                </Button>
                            </div>
                        </div>

                        {/* Custom MCP Servers Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(139,233,253,0.5)" }}>
                                External Remote MCPs
                            </h3>
                            <div className="border border-[#1a1b26] rounded-lg p-6 bg-[#0b0b11] space-y-4">
                                {values.config?.custom_mcp_servers && values.config.custom_mcp_servers.length > 0 ? (
                                    <div className="space-y-3">
                                        {values.config.custom_mcp_servers.map((mcp) => (
                                            <div key={mcp.url} className="flex items-center justify-between p-3 bg-[#050101] rounded-lg border border-[#1a1b26] group">
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-xs font-mono text-[#8be9fd] truncate block">{mcp.url}</span>
                                                    <span className="text-[10px] text-[#6272a4] uppercase font-bold">{Object.keys(mcp.headers || {}).length} Active Headers</span>
                                                </div>
                                                <Button variant="ghost" size="sm" type="button" onClick={() => handleRemoveCustomMCP(mcp.url)} className="text-[#ff5555] hover:bg-[#ff5555]/10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border border-dashed border-[#1a1b26] rounded-lg bg-[#050101]/50">
                                        <p className="text-[#6272a4] font-mono text-sm uppercase tracking-widest">No custom endpoints</p>
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    onClick={() => setCustomMcpDialogOpen(true)}
                                    className="w-full bg-[#8be9fd] hover:bg-[#8be9fd] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#41a0b3] hover:border-[#41a0b3] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Connect Custom MCP
                                </Button>
                            </div>
                        </div>

                        {/* Agent Tools Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(80,250,123,0.5)" }}>
                                Subordinate Agents
                            </h3>
                            <div className="border border-[#1a1b26] rounded-lg p-6 bg-[#0b0b11] space-y-4">
                                {values.config?.agent_tools && values.config.agent_tools.length > 0 ? (
                                    <div className="space-y-3">
                                        {values.config.agent_tools.map((toolId) => (
                                            <div key={toolId} className="flex items-center justify-between p-3 bg-[#050101] rounded-lg border border-[#1a1b26] group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-[#50fa7b] animate-pulse shadow-[0_0_8px_#50fa7b]" />
                                                    <span className="text-sm font-bold text-[#f8f8f2]">{agents.find(a => a.id === toolId)?.name || toolId}</span>
                                                </div>
                                                <Button variant="ghost" size="sm" type="button" onClick={() => handleRemoveAgentTool(toolId)} className="text-[#ff5555] hover:bg-[#ff5555]/10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border border-dashed border-[#1a1b26] rounded-lg bg-[#050101]/50">
                                        <p className="text-[#6272a4] font-mono text-sm uppercase tracking-widest">No linked agents</p>
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    onClick={() => setAgentToolDialogOpen(true)}
                                    className="w-full bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Recruit Sub-Agent
                                </Button>
                            </div>
                        </div>

                        {/* Custom Tools Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(241,250,140,0.5)" }}>
                                Custom HTTP Tools
                            </h3>
                            <div className="border border-[#1a1b26] rounded-lg p-6 bg-[#0b0b11] space-y-4">
                                {values.config?.custom_tools?.http_tools && values.config.custom_tools.http_tools.length > 0 ? (
                                    <div className="space-y-3">
                                        {values.config.custom_tools.http_tools.map((tool, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-[#050101] rounded-lg border border-[#1a1b26] group">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[#f1fa8c] font-black text-[10px] uppercase">{tool.method}</span>
                                                        <span className="text-[#f8f8f2] text-sm font-bold truncate">{tool.name}</span>
                                                    </div>
                                                    <span className="text-[10px] text-[#6272a4] font-mono block truncate mt-1">{tool.endpoint}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" type="button" onClick={() => handleEditCustomTool(tool, idx)} className="text-[#bd93f9] hover:bg-[#bd93f9]/10 h-8 w-8 p-0">
                                                        <Settings className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" type="button" onClick={() => handleRemoveCustomTool(idx)} className="text-[#ff5555] hover:bg-[#ff5555]/10 h-8 w-8 p-0">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border border-dashed border-[#1a1b26] rounded-lg bg-[#050101]/50">
                                        <p className="text-[#6272a4] font-mono text-sm uppercase tracking-widest">Empty tool belt</p>
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    onClick={() => setCustomToolDialogOpen(true)}
                                    className="w-full bg-[#f1fa8c] hover:bg-[#f1fa8c] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#c7d04f] hover:border-[#c7d04f] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Craft New Tool
                                </Button>
                            </div>
                        </div>

                        {/* Dialogs */}
                        <MCPDialog
                            open={mcpDialogOpen}
                            onOpenChange={setMcpDialogOpen}
                            onSave={handleSaveMCP}
                            availableMCPs={availableMCPs}
                            selectedMCP={
                                availableMCPs.find((m) => selectedMCP?.id === m.id) || null
                            }
                            initialEnvs={selectedMCP?.envs || {}}
                            initialTools={selectedMCP?.tools || []}
                        />
                        <CustomMCPDialog
                            open={customMcpDialogOpen}
                            onOpenChange={setCustomMcpDialogOpen}
                            onSave={handleSaveCustomMCP}
                        />
                        <AgentToolDialog
                            open={agentToolDialogOpen}
                            onOpenChange={setAgentToolDialogOpen}
                            onSave={handleAddAgentTool}
                            currentAgentId={values.id}
                        />
                        <CustomToolDialog
                            open={customToolDialogOpen}
                            onOpenChange={setCustomToolDialogOpen}
                            onSave={handleSaveCustomTool}
                            initialTool={editingCustomTool}
                        />
                    </>
                );
            case AgentType.A2A:
                return (
                    <A2AAgentConfig
                        values={values}
                        onChange={onChange}
                    />
                );
            case AgentType.SEQUENTIAL:
                return (
                    <SequentialAgentConfig
                        values={values}
                        onChange={onChange}
                        agents={agents}
                        getAgentNameById={getAgentNameById}
                    />
                );
            case AgentType.PARALLEL:
                return (
                    <ParallelAgentConfig
                        values={values}
                        onChange={onChange}
                        agents={agents}
                        getAgentNameById={getAgentNameById}
                    />
                );
            case AgentType.LOOP:
                return (
                    <LoopAgentConfig
                        values={values}
                        onChange={onChange}
                        agents={agents}
                        getAgentNameById={getAgentNameById}
                    />
                );
            case AgentType.TASK:
                return (
                    <div className="text-center py-8 border-2 border-dashed border-[#6272a4] rounded-lg bg-[#1a1b26]">
                        <p className="text-[#6272a4] font-bold uppercase tracking-wider">Task Configuration</p>
                        <p className="text-xs text-[#6272a4] mt-2">Configure tasks in the "Tasks" tab</p>
                    </div>
                );
            case AgentType.WORKFLOW:
                return (
                    <div className="border-2 border-[#6272a4] rounded-xl p-6 bg-[#0b0b11] shadow-neu">
                        <div className="bg-[#0b0b11] border border-[#1a1b26] rounded-lg p-8 text-center">
                            <div className="w-16 h-16 bg-[#bd93f9] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(189,147,249,0.4)]">
                                <GitBranch size={32} className="text-black" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#bd93f9] mb-2">
                                Workflow Agent Configuration
                            </p>
                            <p className="text-[#6272a4] text-sm mb-6 max-w-md mx-auto">
                                Configure your workflow visually using the Workflow Editor.
                            </p>
                            <button
                                type="button"
                                onClick={() => window.location.href = `/agents/workflow/${values.id}`}
                                className="bg-[#bd93f9] hover:bg-[#ff79c6] text-black font-black py-3 px-6 rounded transition-all shadow-[0_0_15px_rgba(189,147,249,0.3)] hover:shadow-[0_0_20px_rgba(255,121,198,0.4)] text-[10px] uppercase tracking-widest inline-flex items-center gap-2"
                            >
                                <Settings size={16} />
                                Open Workflow Editor
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            {credentialsSection}
            {renderSpecificConfig()}
        </div>
    );
}
