/*
* @author: Davidson Gomes
* @file: /pages/AgentsPage.tsx
*/
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    listAgents,
    deleteAgent,
    createAgent,
    updateAgent,
    listFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    shareAgent,
    assignAgentToFolder,
    type Folder
} from '@/services/agentService';
import type { Agent, AgentCreate } from '@/types/agent';
import { AgentList } from '@/components/agents/AgentList';
import { AgentSidebar } from '@/components/agents/AgentSidebar';
import MoveAgentDialog from '@/components/agents/dialogs/MoveAgentDialog';
import SearchInput from '@/components/agents/SearchInput';
import AgentTypeSelector from '@/components/agents/AgentTypeSelector';
import AgentFormDialog from '@/components/agents/dialogs/AgentFormDialog';
import { FolderFormDialog } from '@/components/agents/dialogs/FolderFormDialog';
import { ShareAgentDialog } from '@/components/agents/dialogs/ShareAgentDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { useClient } from '@/contexts/ClientContext';
import { Plus, Download, Upload } from 'lucide-react';
import { AgentType } from '@/types/agent';
import { exportAsJson } from '@/lib/utils';
import { importAgentFromJson } from '@/services/agentService';
import { AdminClientSelector } from '@/components/AdminClientSelector';
import { useAuth } from '@/contexts/AuthContext';

const AgentsPage: React.FC = () => {
    const { toast } = useToast();
    const { clientId } = useClient();
    const { user } = useAuth();
    const canEdit = user?.role !== 'viewer';
    const canManageEvents = user?.is_admin || user?.role === 'owner' || user?.role === 'admin';

    const [agents, setAgents] = useState<Agent[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<AgentType | ''>('');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // Dialogs
    // Dialogs
    const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | undefined>();
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [agentToShare, setAgentToShare] = useState<Agent | null>(null);
    const [sharedApiKey, setSharedApiKey] = useState('');

    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState<any>(null); // Using any temporarily to match existing structure, optimally Folder
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMoveAgentDialogOpen, setIsMoveAgentDialogOpen] = useState(false);
    const [agentToMove, setAgentToMove] = useState<Agent | null>(null);

    useEffect(() => {
        if (clientId) {
            loadData();
        }
    }, [clientId, selectedFolderId]);

    const loadData = async () => {
        if (!clientId) return;

        setIsLoading(true);
        try {
            // Load folders
            const foldersData = await listFolders(clientId);
            setFolders(foldersData.data);

            // Load agents (optionally filtered by folder if API supports it, or filter client-side)
            // For now, listing all and filtering client side or using the service param
            const agentsResponse = await listAgents(clientId, 0, 100, selectedFolderId || undefined);
            setAgents(agentsResponse.data);

        } catch (err: any) {
            console.error("Error loading data:", err);
            const errorMessage = typeof err?.response?.data?.detail === 'string'
                ? err.response.data.detail
                : 'Failed to load data';

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Memoized filtering - replaces filterAgents function
    const filteredAgents = useMemo(() => {
        let filtered = agents;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter((agent) =>
                agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by type
        if (selectedType) {
            filtered = filtered.filter((agent) => agent.type === selectedType);
        }

        return filtered;
    }, [agents, searchQuery, selectedType]);

    const handleDeleteAgent = async (agent: Agent) => {
        if (!confirm('Are you sure you want to delete this agent?')) return;

        try {
            await deleteAgent(agent.id);
            setAgents(agents.filter((a) => a.id !== agent.id));
            toast.success("Agent deleted successfully");
        } catch (err: any) {
            const errorMessage = typeof err?.response?.data?.detail === 'string'
                ? err.response.data.detail
                : 'Failed to delete agent';

            toast.error(errorMessage);
        }
    };

    const handleEditAgent = (agent: Agent) => {
        setEditingAgent(agent);
        setIsAgentDialogOpen(true);
    };

    const handleMoveAgent = (agent: Agent) => {
        setAgentToMove(agent);
        setIsMoveAgentDialogOpen(true);
    };

    const handleMoveAgentSubmit = async (targetFolderId: string | null) => {
        if (!agentToMove || !clientId) return;

        try {
            await assignAgentToFolder(agentToMove.id, targetFolderId, clientId);
            toast.success(
                targetFolderId
                    ? 'Agent moved to folder successfully'
                    : 'Agent removed from folder successfully'
            );
            loadData();
            setIsMoveAgentDialogOpen(false);
            setAgentToMove(null);
        } catch (error) {
            console.error('Error moving agent:', error);
            toast.error('Failed to move agent');
        }
    };

    const handleShareAgent = async (agent: Agent) => {
        if (!clientId) return;
        try {
            const response = await shareAgent(agent.id, clientId);
            if (response.data && response.data.api_key) {
                setSharedApiKey(response.data.api_key);
                setAgentToShare(agent);
                setIsShareDialogOpen(true);
                toast.success('Agent shared successfully');
            }
        } catch (error) {
            console.error('Share error:', error);
            toast.error('Failed to share agent');
        }
    };

    const handleAgentFormSubmit = async (data: any) => {
        if (!clientId) return;

        try {
            const agentData: AgentCreate = {
                ...data,
                client_id: clientId,
                folder_id: selectedFolderId || undefined,
                config: {
                    ...(data.config || {}),
                    temperature: data.temperature || data.config?.temperature,
                } as any
            };

            if (editingAgent) {
                await updateAgent(editingAgent.id, agentData);
                toast.success("Agent updated successfully");
            } else {
                await createAgent(agentData);
                toast.success("Agent created successfully");
            }
            loadData(); // Reload data
            setIsAgentDialogOpen(false);
            setEditingAgent(undefined);
        } catch (err: any) {
            const errorMessage = typeof err?.response?.data?.detail === 'string'
                ? err.response.data.detail
                : 'An error occurred while saving';

            toast.error(errorMessage);
            throw err;
        }
    };

    // Folder handlers
    const handleAddFolder = () => {
        setEditingFolder(null);
        setIsFolderDialogOpen(true);
    };

    const handleEditFolder = (folder: any) => {
        setEditingFolder(folder);
        setIsFolderDialogOpen(true);
    };

    const handleSaveFolder = async (data: any) => {
        if (!clientId) return;

        try {
            if (editingFolder) {
                await updateFolder(editingFolder.id, data, clientId);
                toast.success("Folder updated");
            } else {
                await createFolder({
                    ...data,
                    client_id: clientId
                });
                toast.success("Folder created");
            }
            loadData();
            setIsFolderDialogOpen(false);
        } catch (error) {
            console.error("Error saving folder:", error);
            toast.error("Failed to save folder");
        }
    };

    const handleDeleteFolder = async (folder: any) => {
        if (!clientId) return;
        if (!confirm(`Delete folder ${folder.name}?`)) return;

        try {
            await deleteFolder(folder.id, clientId);
            loadData();
            toast.success("Folder deleted");
        } catch (e) {
            toast.error("Failed to delete folder");
        }
    };

    // Export all agents as JSON
    const handleExportAllAgents = () => {
        try {
            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            const filename = `agents-export-${formattedDate}`;

            const result = exportAsJson({ agents: filteredAgents }, filename, true, agents);

            if (result) {
                toast.success(`${filteredAgents.length} agent(s) exported to JSON`);
            } else {
                throw new Error("Export failed");
            }
        } catch (error) {
            console.error("Error exporting agents:", error);
            toast.error("There was an error exporting the agents");
        }
    };

    // Import agent from JSON
    const handleImportAgentJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !clientId) return;

        try {
            await importAgentFromJson(file, clientId);
            toast.success("Agent was imported successfully");
            loadData();

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error("Error importing agent:", error);
            toast.error("There was an error importing the agent");
        }
    };

    // API Key Handlers removed

    if (user?.is_admin && !clientId) {
        return <AdminClientSelector />;
    }

    return (
        <div className="pt-6 min-h-full">
            <AgentSidebar
                visible={isSidebarVisible}
                folders={folders}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onAddFolder={handleAddFolder}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
                onToggle={() => setIsSidebarVisible(!isSidebarVisible)}
            />

            <div className={`transition-all duration-300 ${isSidebarVisible ? 'ml-64' : 'ml-16'} p-6`}>
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">

                            <h1 className="text-3xl font-black text-white tracking-widest uppercase" style={{ textShadow: "0 0 10px rgba(189,147,249,0.5)" }}>
                                Agents
                            </h1>
                            <span className="bg-[#bd93f9]/20 text-[#bd93f9] px-3 py-1 rounded text-xs font-bold border border-[#bd93f9]/40 shadow-[0_0_10px_rgba(189,147,249,0.2)]">
                                {filteredAgents.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleExportAllAgents}
                                className="bg-[#bd93f9]/10 text-[#bd93f9] hover:bg-[#bd93f9]/20 font-black uppercase tracking-wider border border-[#bd93f9]/40 hover:border-[#bd93f9] transition-all h-11 rounded-xl shadow-[0_0_10px_rgba(189,147,249,0.2)]"
                                title="Export all agents as JSON"
                            >
                                <Download className="mr-2 h-4 w-4" /> Export_All
                            </Button>

                            {canEdit && (
                                <>
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-[#bd93f9]/10 text-[#bd93f9] hover:bg-[#bd93f9]/20 font-black uppercase tracking-wider border border-[#bd93f9]/40 hover:border-[#bd93f9] transition-all h-11 rounded-xl shadow-[0_0_10px_rgba(189,147,249,0.2)]"
                                        title="Import agent from JSON"
                                    >
                                        <Upload className="mr-2 h-4 w-4" /> Import
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            setEditingAgent(undefined);
                                            setIsAgentDialogOpen(true);
                                        }}
                                        className="bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all h-11 rounded-xl"
                                    >
                                        <Plus className="mr-2 h-5 w-5 stroke-[3]" /> New_Agent
                                    </Button>
                                </>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImportAgentJSON}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0b0b11] p-4 rounded border border-[#1a1b26] shadow-xl">
                        <div className="w-full md:w-1/3">
                            <SearchInput
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search agents..."
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <AgentTypeSelector
                                value={selectedType}
                                onChange={setSelectedType} // Fixed type mismatch
                            />
                        </div>
                    </div>
                </div>

                <AgentList
                    agents={filteredAgents}
                    isLoading={isLoading}
                    searchTerm={searchQuery}
                    selectedFolderId={selectedFolderId}
                    availableMCPs={[]} // Mocking for now
                    getApiKeyNameById={(id) => id || null} // Mocking for now
                    getAgentNameById={(id) => id} // Mocking for now
                    onEdit={handleEditAgent}
                    onDelete={handleDeleteAgent}
                    onMove={handleMoveAgent}
                    onShare={handleShareAgent}
                    onCreateAgent={() => {
                        setEditingAgent(undefined);
                        setIsAgentDialogOpen(true);
                    }}
                    folders={folders}
                />
            </div>

            <AgentFormDialog
                open={isAgentDialogOpen}
                onClose={() => setIsAgentDialogOpen(false)}
                onSubmit={handleAgentFormSubmit}
                agent={editingAgent}
                mode={editingAgent ? 'edit' : 'create'}
            />

            {agentToShare && (
                <ShareAgentDialog
                    open={isShareDialogOpen}
                    onOpenChange={setIsShareDialogOpen}
                    agent={agentToShare}
                    apiKey={sharedApiKey}
                />
            )}

            <MoveAgentDialog
                open={isMoveAgentDialogOpen}
                onClose={() => setIsMoveAgentDialogOpen(false)}
                onSubmit={handleMoveAgentSubmit}
                agent={agentToMove || undefined}
                folders={folders}
                currentFolderId={agentToMove?.folder_id}
            />

            <FolderFormDialog
                open={isFolderDialogOpen}
                onOpenChange={setIsFolderDialogOpen}
                onSave={handleSaveFolder}
                editingFolder={editingFolder}
            />
        </div>
    );
};

export default AgentsPage;
