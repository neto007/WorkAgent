import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Cpu, LogOut, Users, Bot, Server, FileText, User, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import { useToast } from '@/hooks/useToast';
import { ApiKeysDialog } from '@/components/agents/dialogs/ApiKeysDialog';
import { listApiKeys, createApiKey, updateApiKey, deleteApiKey, type ApiKey } from '@/services/agentService';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { clientId } = useClient();
    const { toast } = useToast();

    const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = React.useState(false);
    const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const loadApiKeys = async () => {
        if (!clientId) return;
        setIsLoading(true);
        try {
            const apiKeysData = await listApiKeys(clientId);
            setApiKeys(apiKeysData.data);
        } catch (error) {
            console.error("Error loading API keys:", error);
            toast.error("Failed to load API keys");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenApiKeys = () => {
        loadApiKeys();
        setIsApiKeysDialogOpen(true);
    };

    const handleAddApiKey = async (data: any) => {
        if (!clientId) return;
        try {
            await createApiKey({ ...data, client_id: clientId });
            toast.success("API Key added successfully");
            loadApiKeys();
        } catch (error) {
            console.error("Error adding API key:", error);
            toast.error("Failed to add API key");
        }
    };

    const handleUpdateApiKey = async (id: string, data: any) => {
        if (!clientId) return;
        try {
            await updateApiKey(id, data, clientId);
            toast.success("API Key updated successfully");
            loadApiKeys();
        } catch (error) {
            console.error("Error updating API key:", error);
            toast.error("Failed to update API key");
        }
    };

    const handleDeleteApiKey = async (id: string) => {
        if (!clientId) return;
        try {
            await deleteApiKey(id, clientId);
            setApiKeys(prev => prev.filter(k => k.id !== id));
            toast.success("API Key deleted successfully");
        } catch (error) {
            console.error("Error deleting API key:", error);
            toast.error("Failed to delete API key");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/agents', label: 'Agents', icon: Bot },
        { path: '/chat', label: 'Chat', icon: Bot },
        { path: '/documentation', label: 'Docs', icon: FileText },
    ];

    // Show clients and MCP only for admins
    if (user?.is_admin) {
        navItems.unshift({ path: '/clients', label: 'Clients', icon: Users });
        // MCP servers management should only be visible to admins
        navItems.splice(2, 0, { path: '/mcp-servers', label: 'MCP', icon: Server });
    }

    return (
        <header className="h-16 border-b border-[#1a1b26] bg-[#050101]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
            {/* Logo */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#bd93f9] rounded flex items-center justify-center shadow-[0_0_15px_rgba(189,147,249,0.4)]">
                    <Cpu size={20} className="text-black" />
                </div>
                <h1 className="text-xl font-black tracking-[0.2em] uppercase italic text-[#6272a4]">
                    Shield<span className="text-[#50fa7b]">AI</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${isActive
                                ? 'bg-[#bd93f9] text-black shadow-[0_0_10px_rgba(189,147,249,0.3)]'
                                : 'text-[#6272a4] hover:text-[#bd93f9] hover:bg-[#1a1b26]'
                                }`}
                        >
                            <Icon size={14} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleOpenApiKeys}
                    className="flex items-center gap-2 px-3 py-2 text-[#6272a4] hover:text-[#50fa7b] transition-all border border-transparent hover:border-[#50fa7b]/30 rounded"
                    title="Manage API Keys"
                >
                    <Key size={16} />
                    <span className="text-[10px] font-bold uppercase hidden md:inline">Keys</span>
                </button>

                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-3 py-2 text-[#6272a4] hover:text-[#bd93f9] transition-all"
                >
                    <User size={16} />
                    <span className="text-[10px] font-bold uppercase">{user?.email}</span>
                </button>

                <div className="w-[1px] h-6 bg-[#1a1b26]"></div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-[#ff5555] text-[10px] font-black uppercase tracking-widest hover:bg-[#ff5555]/10 transition-all rounded"
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </div>

            <ApiKeysDialog
                open={isApiKeysDialogOpen}
                onOpenChange={setIsApiKeysDialogOpen}
                apiKeys={apiKeys}
                isLoading={isLoading}
                clientId={clientId || ''}
                onAddApiKey={handleAddApiKey}
                onUpdateApiKey={handleUpdateApiKey}
                onDeleteApiKey={handleDeleteApiKey}
            />
        </header>
    );
};

export default Header;
