/*
* @author: Davidson Gomes
* @file: /components/chat/SessionList.tsx
*/

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import type { ChatSession } from "@/services/sessionService";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type Agent } from '@/types/agent';

interface SessionListProps {
    sessions: ChatSession[];
    agents: Agent[];
    selectedSession: string | null;
    isLoading: boolean;
    searchTerm: string;
    selectedAgentFilter: string;
    showAgentFilter: boolean;
    setSearchTerm: (value: string) => void;
    setSelectedAgentFilter: (value: string) => void;
    setShowAgentFilter: (value: boolean) => void;
    setSelectedSession: (value: string | null) => void;
    setIsNewChatDialogOpen: (value: boolean) => void;
}

export function SessionList({
    sessions,
    agents,
    selectedSession,
    isLoading,
    searchTerm,
    selectedAgentFilter,
    showAgentFilter,
    setSearchTerm,
    setSelectedAgentFilter,
    setShowAgentFilter,
    setSelectedSession,
    setIsNewChatDialogOpen,
}: SessionListProps) {
    const filteredSessions = sessions.filter((session) => {
        const matchesSearchTerm = session.id
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        if (selectedAgentFilter === "all") {
            return matchesSearchTerm;
        }

        const sessionAgentId = session.id.split("_")[1];
        return matchesSearchTerm && sessionAgentId === selectedAgentFilter;
    });

    const sortedSessions = [...filteredSessions].sort((a, b) => {
        const updateTimeA = new Date(a.update_time || a.created_at || 0).getTime();
        const updateTimeB = new Date(b.update_time || b.created_at || 0).getTime();

        return updateTimeB - updateTimeA;
    });

    const formatDateTime = (dateTimeStr?: string) => {
        if (!dateTimeStr) return "";
        try {
            const date = new Date(dateTimeStr);

            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");

            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (error) {
            return "Invalid date";
        }
    };

    const getExternalId = (sessionId: string) => {
        return sessionId.split("_")[0];
    };

    return (
        <div className="w-64 border-r border-[#1a1b26] flex flex-col bg-[#050101] shadow-[5px_0_15px_rgba(0,0,0,0.3)] z-10 transition-all duration-300">
            <div className="p-4 border-b border-[#1a1b26] pb-6">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        onClick={() => setIsNewChatDialogOpen(true)}
                        className="w-full bg-[#bd93f9] hover:bg-[#ff79c6] text-[#282a36] font-black uppercase tracking-wider border-b-4 border-[#8b6db5] hover:border-[#bd5db8] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                        size="sm"
                    >
                        <Plus className="h-4 w-4 mr-2 stroke-[3]" /> New Chat
                    </Button>
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6272a4]" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-[#1a1b26] border-[#343746] text-[#f8f8f2] placeholder:text-[#6272a4] focus-visible:ring-[#bd93f9] rounded-xl h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#6272a4] hover:text-[#bd93f9] hover:bg-[#1a1b26] text-[10px] uppercase font-bold tracking-widest"
                            onClick={() => setShowAgentFilter(!showAgentFilter)}
                        >
                            <Filter className="h-3 w-3 mr-1" />
                            Filter
                        </Button>

                        {selectedAgentFilter !== "all" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAgentFilter("all")}
                                className="text-[#6272a4] hover:text-[#ff5555] hover:bg-[#ff5555]/10 text-[10px] uppercase font-bold tracking-widest"
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    {showAgentFilter && (
                        <div className="pt-1">
                            <Select
                                value={selectedAgentFilter}
                                onValueChange={setSelectedAgentFilter}
                            >
                                <SelectTrigger className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl">
                                    <SelectValue placeholder="Filter by agent" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl">
                                    <SelectItem
                                        value="all"
                                        className="focus:bg-[#bd93f9] focus:text-[#282a36]"
                                    >
                                        All agents
                                    </SelectItem>
                                    {agents.map((agent) => (
                                        <SelectItem
                                            key={agent.id}
                                            value={agent.id}
                                            className="focus:bg-[#bd93f9] focus:text-[#282a36]"
                                        >
                                            {agent.name.slice(0, 15)}{" "}
                                            {agent.name.length > 15 && "..."}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-5 w-5 text-[#bd93f9] animate-spin" />
                    </div>
                ) : sortedSessions.length > 0 ? (
                    <div className="px-3 pt-3 space-y-2 pb-3">
                        {sortedSessions.map((session) => {
                            const agentId = session.id.split("_")[1];
                            const agentInfo = agents.find((a) => a.id === agentId);
                            const externalId = getExternalId(session.id);

                            return (
                                <div
                                    key={session.id}
                                    className={`p-3 rounded-xl cursor-pointer transition-all group relative border-2 ${selectedSession === session.id
                                        ? "bg-[#1a1b26] border-[#bd93f9] shadow-[0_0_10px_rgba(189,147,249,0.2)]"
                                        : "bg-[#0b0b11] border-transparent hover:border-[#6272a4]/50 hover:bg-[#1a1b26]"
                                        }`}
                                    onClick={() => setSelectedSession(session.id)}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${selectedSession === session.id ? "bg-[#bd93f9] shadow-[0_0_5px_rgba(189,147,249,0.8)]" : "bg-[#44475a]"}`}></div>
                                        <div className={`font-bold truncate max-w-[150px] ${selectedSession === session.id ? "text-white" : "text-[#6272a4] group-hover:text-[#f8f8f2]"}`}>
                                            {externalId}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        {agentInfo && (
                                            <Badge className="bg-[#282a36] text-[#bd93f9] border-[#44475a] hover:bg-[#bd93f9] hover:text-[#282a36] text-[10px] uppercase font-bold tracking-wider">
                                                {agentInfo.name.slice(0, 10)}
                                                {agentInfo.name.length > 10 && ".."}
                                            </Badge>
                                        )}
                                        <div className="text-[10px] text-[#44475a] font-mono">
                                            {formatDateTime(session.update_time || session.created_at).split(' ')[0]}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : searchTerm || selectedAgentFilter !== "all" ? (
                    <div className="text-center py-8 text-[#6272a4] font-medium text-sm">
                        No results found
                    </div>
                ) : (
                    <div className="text-center py-8 text-[#6272a4] font-medium text-sm px-4">
                        Click "New Chat" to start a conversation -&gt;
                    </div>
                )}
            </div>
        </div>
    );
}
