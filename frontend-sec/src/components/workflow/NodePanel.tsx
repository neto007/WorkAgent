"use client";

import type React from "react";
import { useState } from "react";
import {
    User,
    MessageSquare,
    Filter,
    Clock,
    Plus,
    MenuSquare,
    Layers,
    MoveRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDnD } from "@/contexts/DnDContext";

export function NodePanel() {
    const [activeTab, setActiveTab] = useState("content");
    const { setType } = useDnD();

    const nodeTypes = {
        content: [
            {
                id: "agent-node",
                name: "Agent",
                icon: User,
                color: "text-[#bd93f9]",
                bgColor: "bg-[#bd93f9]/10",
                borderColor: "border-[#bd93f9]/30",
                hoverColor: "group-hover:bg-[#bd93f9]/20",
                glowColor: "group-hover:shadow-[0_0_15px_rgba(189,147,249,0.2)]",
                description: "Add an AI agent to process messages and execute tasks",
            },
            {
                id: "message-node",
                name: "Message",
                icon: MessageSquare,
                color: "text-[#ffb86c]",
                bgColor: "bg-[#ffb86c]/10",
                borderColor: "border-[#ffb86c]/30",
                hoverColor: "group-hover:bg-[#ffb86c]/20",
                glowColor: "group-hover:shadow-[0_0_15px_rgba(255,184,108,0.2)]",
                description: "Send a message to users or other nodes in the workflow",
            },
        ],
        logic: [
            {
                id: "condition-node",
                name: "Condition",
                icon: Filter,
                color: "text-[#bd93f9]",
                bgColor: "bg-[#bd93f9]/10",
                borderColor: "border-[#bd93f9]/30",
                hoverColor: "group-hover:bg-[#bd93f9]/20",
                glowColor: "group-hover:shadow-[0_0_15px_rgba(189,147,249,0.2)]",
                description: "Create a decision point with multiple outcomes based on conditions",
            },
            {
                id: "delay-node",
                name: "Delay",
                icon: Clock,
                color: "text-[#f1fa8c]",
                bgColor: "bg-[#f1fa8c]/10",
                borderColor: "border-[#f1fa8c]/30",
                hoverColor: "group-hover:bg-[#f1fa8c]/20",
                glowColor: "group-hover:shadow-[0_0_15px_rgba(241,250,140,0.2)]",
                description: "Add a time delay between workflow operations",
            },
        ],
    };

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
        setType(nodeType);
    };

    const handleNodeAdd = (nodeType: string) => {
        setType(nodeType);
    };

    return (
        <div className="bg-[#0b0b11]/90 backdrop-blur-md border-2 border-[#1a1b26] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] w-[320px] transition-all duration-300 ease-in-out overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b-2 border-[#1a1b26]">
                <div className="flex items-center gap-2 text-[#f8f8f2]">
                    <Layers className="h-5 w-5 text-[#bd93f9]" />
                    <h3 className="font-black text-sm uppercase tracking-widest">Workflow Nodes</h3>
                </div>
                <p className="text-[10px] text-[#6272a4] mt-1 font-bold">
                    Drag nodes to the canvas or click + to add
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-4 pt-3">
                    <TabsList className="w-full bg-[#1a1b26] grid grid-cols-2 p-1 rounded-lg border-2 border-[#282a36]">
                        <TabsTrigger
                            value="content"
                            className={cn(
                                "rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                                "data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#bd93f9]/20 data-[state=active]:to-[#bd93f9]/10",
                                "data-[state=active]:text-[#bd93f9] data-[state=active]:shadow-[0_0_10px_rgba(189,147,249,0.2)]",
                                "data-[state=inactive]:text-[#6272a4]"
                            )}
                        >
                            <MenuSquare className="h-3.5 w-3.5 mr-1.5" />
                            Content
                        </TabsTrigger>
                        <TabsTrigger
                            value="logic"
                            className={cn(
                                "rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                                "data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#f1fa8c]/20 data-[state=active]:to-[#f1fa8c]/10",
                                "data-[state=active]:text-[#f1fa8c] data-[state=active]:shadow-[0_0_10px_rgba(241,250,140,0.2)]",
                                "data-[state=inactive]:text-[#6272a4]"
                            )}
                        >
                            <Filter className="h-3.5 w-3.5 mr-1.5" />
                            Logic
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="content" className="p-3 space-y-2 mt-0">
                    {nodeTypes.content.map((node) => (
                        <TooltipProvider key={node.id} delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        draggable
                                        onDragStart={(event) => onDragStart(event, node.id)}
                                        className={cn(
                                            "group flex items-center gap-3 p-3.5 border-2 rounded-lg cursor-grab transition-all duration-300",
                                            "backdrop-blur-sm hover:shadow-lg",
                                            node.borderColor,
                                            node.bgColor,
                                            node.glowColor
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                                                "bg-[#1a1b26] group-hover:scale-105",
                                                node.hoverColor
                                            )}
                                        >
                                            <node.icon className={cn("h-5 w-5", node.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={cn("font-bold block text-sm", node.color)}>
                                                {node.name}
                                            </span>
                                            <span className="text-[10px] text-[#6272a4] truncate block">
                                                {node.description}
                                            </span>
                                        </div>
                                        <div
                                            onClick={() => handleNodeAdd(node.id)}
                                            className={cn(
                                                "flex items-center justify-center h-7 w-7 rounded-md bg-[#1a1b26] text-[#6272a4]",
                                                "hover:bg-gradient-to-r hover:text-[#0b0b11] transition-all",
                                                node.id === "agent-node"
                                                    ? "hover:from-[#bd93f9] hover:to-[#bd93f9]/80"
                                                    : "hover:from-[#ffb86c] hover:to-[#ffb86c]/80"
                                            )}
                                        >
                                            <Plus size={16} />
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="bg-[#0b0b11] border-2 border-[#1a1b26] text-[#f8f8f2]"
                                >
                                    <div className="p-1 max-w-[200px]">
                                        <p className="font-bold text-sm">{node.name} Node</p>
                                        <p className="text-xs text-[#6272a4] mt-1">{node.description}</p>
                                        <div className="flex items-center mt-2 pt-2 border-t-2 border-[#1a1b26] text-xs text-[#6272a4]">
                                            <MoveRight className="h-3 w-3 mr-1.5" />
                                            <span>Drag to canvas or click + to add</span>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </TabsContent>

                <TabsContent value="logic" className="p-3 space-y-2 mt-0">
                    {nodeTypes.logic.map((node) => (
                        <TooltipProvider key={node.id} delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        draggable
                                        onDragStart={(event) => onDragStart(event, node.id)}
                                        className={cn(
                                            "group flex items-center gap-3 p-3.5 border-2 rounded-lg cursor-grab transition-all duration-300",
                                            "backdrop-blur-sm hover:shadow-lg",
                                            node.borderColor,
                                            node.bgColor,
                                            node.glowColor
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                                                "bg-[#1a1b26] group-hover:scale-105",
                                                node.hoverColor
                                            )}
                                        >
                                            <node.icon className={cn("h-5 w-5", node.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={cn("font-bold block text-sm", node.color)}>
                                                {node.name}
                                            </span>
                                            <span className="text-[10px] text-[#6272a4] truncate block">
                                                {node.description}
                                            </span>
                                        </div>
                                        <div
                                            onClick={() => handleNodeAdd(node.id)}
                                            className={cn(
                                                "flex items-center justify-center h-7 w-7 rounded-md bg-[#1a1b26] text-[#6272a4]",
                                                "hover:bg-gradient-to-r hover:text-[#0b0b11] transition-all",
                                                node.id === "condition-node"
                                                    ? "hover:from-[#bd93f9] hover:to-[#bd93f9]/80"
                                                    : "hover:from-[#f1fa8c] hover:to-[#f1fa8c]/80"
                                            )}
                                        >
                                            <Plus size={16} />
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="bg-[#0b0b11] border-2 border-[#1a1b26] text-[#f8f8f2]"
                                >
                                    <div className="p-1 max-w-[200px]">
                                        <p className="font-bold text-sm">{node.name} Node</p>
                                        <p className="text-xs text-[#6272a4] mt-1">{node.description}</p>
                                        <div className="flex items-center mt-2 pt-2 border-t-2 border-[#1a1b26] text-xs text-[#6272a4]">
                                            <MoveRight className="h-3 w-3 mr-1.5" />
                                            <span>Drag to canvas or click + to add</span>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
