import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { MCPServer } from "@/types/mcpServer";
import { Server } from "lucide-react";
import { useState, useEffect } from "react";

interface MCPDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (mcpConfig: {
        id: string;
        envs: Record<string, string>;
        tools: string[];
    }) => void;
    availableMCPs: MCPServer[];
    selectedMCP?: MCPServer | null;
    initialEnvs?: Record<string, string>;
    initialTools?: string[];
}

export function MCPDialog({
    open,
    onOpenChange,
    onSave,
    availableMCPs,
    selectedMCP: initialSelectedMCP = null,
    initialEnvs = {},
    initialTools = [],
}: MCPDialogProps) {
    const [selectedMCP, setSelectedMCP] = useState<MCPServer | null>(null);
    const [mcpEnvs, setMcpEnvs] = useState<Record<string, string>>({});
    const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            if (initialSelectedMCP) {
                setSelectedMCP(initialSelectedMCP);
                setMcpEnvs(initialEnvs);
                setSelectedMCPTools(initialTools);
            } else {
                setSelectedMCP(null);
                setMcpEnvs({});
                setSelectedMCPTools([]);
            }
        }
    }, [open, initialSelectedMCP, initialEnvs, initialTools]);

    const handleSelectMCP = (value: string) => {
        const mcp = availableMCPs.find((m) => m.id === value);
        if (mcp) {
            setSelectedMCP(mcp);
            const initialEnvs: Record<string, string> = {};
            Object.keys(mcp.environments || {}).forEach((key) => {
                initialEnvs[key] = "";
            });
            setMcpEnvs(initialEnvs);
            setSelectedMCPTools([]);
        }
    };

    const toggleMCPTool = (tool: string) => {
        if (selectedMCPTools.includes(tool)) {
            setSelectedMCPTools(selectedMCPTools.filter((t) => t !== tool));
        } else {
            setSelectedMCPTools([...selectedMCPTools, tool]);
        }
    };

    const handleSave = () => {
        if (!selectedMCP) return;

        onSave({
            id: selectedMCP.id,
            envs: mcpEnvs,
            tools: selectedMCPTools,
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col bg-[#0b0b11] border-[#1a1b26] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <DialogHeader className="border-b border-[#1a1b26] pb-4">
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(189,147,249,0.5)" }}>
                        Configure_MCP_Server
                    </DialogTitle>
                    <DialogDescription className="text-[#6272a4]">
                        Select a MCP server and configure its tools.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto py-4">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="mcp-select" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                                MCP Server
                            </Label>
                            <Select
                                value={selectedMCP?.id || ""}
                                onValueChange={handleSelectMCP}
                            >
                                <SelectTrigger className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] focus:ring-[#bd93f9] focus:border-[#bd93f9] focus:ring-1">
                                    <SelectValue placeholder="Select a MCP server" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0b0b11] border-[#1a1b26]">
                                    {availableMCPs.map((mcp) => (
                                        <SelectItem
                                            key={mcp.id}
                                            value={mcp.id}
                                            className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Server className="h-4 w-4 text-[#bd93f9]" />
                                                {mcp.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedMCP && (
                            <>
                                {/* MCP Info */}
                                <div className="border border-[#1a1b26] rounded-lg p-4 bg-[#050101]">
                                    <p className="font-bold text-[#f8f8f2] mb-1">{selectedMCP.name}</p>
                                    <p className="text-sm text-[#6272a4] mb-3">
                                        {selectedMCP.description?.substring(0, 150)}...
                                    </p>
                                    <div className="flex gap-4 text-xs text-[#6272a4]">
                                        <p>
                                            <strong className="text-[#bd93f9]">Type:</strong> {selectedMCP.type}
                                        </p>
                                        <p>
                                            <strong className="text-[#bd93f9]">Config:</strong>{" "}
                                            {selectedMCP.config_type === "sse" ? "SSE" : "Studio"}
                                        </p>
                                    </div>
                                </div>

                                {/* Environment Variables */}
                                {selectedMCP.environments && Object.keys(selectedMCP.environments).length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-[#50fa7b] uppercase tracking-wider">
                                            Environment Variables
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(selectedMCP.environments || {}).map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-3 items-center gap-4">
                                                    <Label
                                                        htmlFor={`env-${key}`}
                                                        className="text-right text-[#f8f8f2] font-mono text-xs"
                                                    >
                                                        {key}
                                                    </Label>
                                                    <Input
                                                        id={`env-${key}`}
                                                        value={mcpEnvs[key] || ""}
                                                        onChange={(e) =>
                                                            setMcpEnvs({
                                                                ...mcpEnvs,
                                                                [key]: e.target.value,
                                                            })
                                                        }
                                                        className="col-span-2 bg-[#050101] border-[#1a1b26] text-[#f8f8f2] focus:border-[#bd93f9] focus:ring-[#bd93f9]/20"
                                                        placeholder={value as string}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Available Tools */}
                                {selectedMCP.tools && selectedMCP.tools.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-[#8be9fd] uppercase tracking-wider">
                                            Available Tools ({selectedMCPTools.length} selected)
                                        </h3>
                                        <div className="border border-[#1a1b26] rounded-lg p-4 bg-[#050101] max-h-64 overflow-y-auto">
                                            <div className="space-y-2">
                                                {selectedMCP.tools.map((tool: any) => (
                                                    <div
                                                        key={tool.id}
                                                        className="flex items-center space-x-3 py-2 hover:bg-[#1a1b26] rounded px-2 transition-colors"
                                                    >
                                                        <Checkbox
                                                            id={`tool-${tool.id}`}
                                                            checked={selectedMCPTools.includes(tool.id)}
                                                            onCheckedChange={() => toggleMCPTool(tool.id)}
                                                            className="data-[state=checked]:bg-[#bd93f9] data-[state=checked]:border-[#bd93f9]"
                                                        />
                                                        <Label
                                                            htmlFor={`tool-${tool.id}`}
                                                            className="text-sm text-[#f8f8f2] cursor-pointer flex-1"
                                                        >
                                                            {tool.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t border-[#1a1b26] pt-4 flex-row gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-transparent border-2 border-[#ff5555] text-[#ff5555] hover:bg-[#ff5555]/10 font-bold uppercase tracking-wider"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!selectedMCP}
                        className="bg-[#bd93f9] hover:bg-[#bd93f9]/80 text-[#0b0b11] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(189,147,249,0.4)] hover:shadow-[0_0_25px_rgba(189,147,249,0.6)] disabled:opacity-50 disabled:shadow-none"
                    >
                        Add MCP
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
