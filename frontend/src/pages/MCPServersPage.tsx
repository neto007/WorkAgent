/*
* @author: Davidson Gomes
* @file: /pages/MCPServersPage.tsx
*/
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Search, Server, Code, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createMCPServer,
    listMCPServers,
    getMCPServer,
    updateMCPServer,
    deleteMCPServer,
} from "@/services/mcpServerService";
import { type MCPServer, type MCPServerCreate, type ToolConfig } from "@/types/mcpServer";
import { useToast } from "@/hooks/useToast";
import { ConfirmationDialog } from "@/components/agents/dialogs/ConfirmationDialog";

import { useAuth } from "@/contexts/AuthContext";

export default function MCPServersPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const isAdmin = user?.is_admin; // Only system admins for now as per backend logic
    // Removed useClient hook as MCPs are global
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
    const [activeTab, setActiveTab] = useState("basic");

    const [serverData, setServerData] = useState<{
        name: string;
        description: string;
        type: string;
        config_type: "sse" | "studio";
        url: string;
        headers: { key: string; value: string }[];
        command: string;
        args: string;
        environments: { key: string }[];
        tools: ToolConfig[];
    }>({
        name: "",
        description: "",
        type: "official",
        config_type: "sse",
        url: "",
        headers: [{ key: "x-api-key", value: "" }],
        command: "npx",
        args: "",
        environments: [],
        tools: [],
    });

    const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);

    useEffect(() => {
        const fetchServers = async () => {
            setIsLoading(true);
            try {
                // MCPs are global, no client ID needed
                const res = await listMCPServers();
                setMcpServers(res.data);
            } catch (error) {
                toast.error("Unable to load servers.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchServers();
    }, []);

    const filteredServers = mcpServers.filter(
        (server) =>
            server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (server.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddHeader = () => {
        setServerData({
            ...serverData,
            headers: [...serverData.headers, { key: "", value: "" }],
        });
    };

    const handleRemoveHeader = (index: number) => {
        const updatedHeaders = [...serverData.headers];
        updatedHeaders.splice(index, 1);
        setServerData({
            ...serverData,
            headers: updatedHeaders,
        });
    };

    const handleHeaderChange = (index: number, field: "key" | "value", value: string) => {
        const updatedHeaders = [...serverData.headers];
        updatedHeaders[index][field] = value;
        setServerData({
            ...serverData,
            headers: updatedHeaders,
        });
    };

    const handleAddEnvironment = () => {
        setServerData({
            ...serverData,
            environments: [...serverData.environments, { key: "" }],
        });
    };

    const handleRemoveEnvironment = (index: number) => {
        const updatedEnvironments = [...serverData.environments];
        updatedEnvironments.splice(index, 1);
        setServerData({
            ...serverData,
            environments: updatedEnvironments,
        });
    };

    const handleEnvironmentChange = (index: number, value: string) => {
        const updatedEnvironments = [...serverData.environments];
        updatedEnvironments[index].key = value;
        setServerData({
            ...serverData,
            environments: updatedEnvironments,
        });
    };

    const handleAddTool = () => {
        const name = "new_tool";
        const newTool: ToolConfig = {
            id: name,
            name: name,
            description: "",
            tags: [],
            examples: [],
            inputModes: ["text"],
            outputModes: ["text"],
        };
        setServerData({
            ...serverData,
            tools: [...serverData.tools, newTool],
        });
    };

    const handleRemoveTool = (index: number) => {
        const updatedTools = [...serverData.tools];
        updatedTools.splice(index, 1);
        setServerData({
            ...serverData,
            tools: updatedTools,
        });
    };

    const handleToolChange = (index: number, field: keyof ToolConfig, value: any) => {
        const updatedTools = [...serverData.tools];
        updatedTools[index] = {
            ...updatedTools[index],
            [field]: value,
        };

        if (field === 'name') {
            updatedTools[index].id = value;
        }

        setServerData({
            ...serverData,
            tools: updatedTools,
        });
    };

    const handleAddServer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const environmentsObj: Record<string, string> = {};
            serverData.environments.forEach((env) => {
                if (env.key) {
                    environmentsObj[env.key] = `env@@${env.key}`;
                }
            });

            const headersObj: Record<string, string> = {};
            serverData.headers.forEach((header) => {
                if (header.key) {
                    headersObj[header.key] = header.value;
                }
            });

            let config_json: any = {};
            if (serverData.config_type === "sse") {
                config_json = {
                    url: serverData.url,
                    headers: headersObj,
                };
            } else if (serverData.config_type === "studio") {
                const args = serverData.args.split("\n").filter((arg) => arg.trim() !== "");
                const envObj: Record<string, string> = {};
                serverData.environments.forEach((env) => {
                    if (env.key) {
                        envObj[env.key] = `env@@${env.key}`;
                    }
                });
                config_json = {
                    command: serverData.command,
                    args: args,
                    env: envObj,
                };
            }

            const payload: MCPServerCreate = {
                name: serverData.name,
                description: serverData.description,
                type: serverData.type,
                config_type: serverData.config_type,
                config_json,
                environments: environmentsObj,
                tools: serverData.tools,
            };

            if (selectedServer) {
                await updateMCPServer(selectedServer.id, payload);
                toast.success(`${serverData.name} was updated successfully.`);
            } else {
                await createMCPServer(payload);
                toast.success(`${serverData.name} was added successfully.`);
            }
            setIsDialogOpen(false);
            resetForm();
            // Pass undefined or null as clientId is not needed
            const res = await listMCPServers();
            setMcpServers(res.data);
        } catch (error) {
            toast.error("Unable to save the MCP server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditServer = async (server: MCPServer) => {
        setIsLoading(true);
        try {
            const res = await getMCPServer(server.id);
            setSelectedServer(res.data);
            const environmentsArray = Object.keys(res.data.environments || {}).map((key) => ({ key }));
            const headersArray = res.data.config_json.headers
                ? Object.entries(res.data.config_json.headers).map(([key, value]) => ({ key, value: value as string }))
                : [{ key: "x-api-key", value: "" }];

            if (res.data.config_type === "sse") {
                setServerData({
                    name: res.data.name,
                    description: res.data.description || "",
                    type: res.data.type,
                    config_type: res.data.config_type as any,
                    url: res.data.config_json.url || "",
                    headers: headersArray,
                    command: "",
                    args: "",
                    environments: environmentsArray,
                    tools: res.data.tools,
                });
            } else if (res.data.config_type === "studio") {
                setServerData({
                    name: res.data.name,
                    description: res.data.description || "",
                    type: res.data.type,
                    config_type: res.data.config_type as any,
                    url: "",
                    headers: [],
                    command: res.data.config_json.command || "npx",
                    args: (res.data.config_json.args || []).join("\n"),
                    environments: environmentsArray,
                    tools: res.data.tools,
                });
            }
            setActiveTab("basic");
            setIsDialogOpen(true);
        } catch (error) {
            toast.error("Unable to search the server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteServer = (server: MCPServer) => {
        setSelectedServer(server);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteServer = async () => {
        if (!selectedServer) return;
        setIsLoading(true);
        try {
            await deleteMCPServer(selectedServer.id);
            toast.success(`${selectedServer.name} was deleted successfully.`);
            setIsDeleteDialogOpen(false);
            setSelectedServer(null);
            const res = await listMCPServers();
            setMcpServers(res.data);
        } catch (error) {
            toast.error("Unable to delete the server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setServerData({
            name: "",
            description: "",
            type: "official",
            config_type: "sse",
            url: "",
            headers: [{ key: "x-api-key", value: "" }],
            command: "npx",
            args: "",
            environments: [],
            tools: [],
        });
        setSelectedServer(null);
        setActiveTab("basic");
    };

    // Removed admin selector block

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#bd93f9] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(189,147,249,0.3)]">
                        <Server size={20} className="text-black" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-wider">
                        MCP <span className="text-[#bd93f9]">Servers</span>
                    </h1>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    {isAdmin && (
                        <DialogTrigger asChild>
                            <Button
                                onClick={resetForm}
                                className="bg-[#50fa7b] hover:bg-[#ff79c6] text-[#282a36] font-black uppercase tracking-wider border-b-4 border-[#3cbb5d] hover:border-[#bd5db8] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                            >
                                <Plus className="mr-2 h-4 w-4 stroke-[3]" />
                                New MCP Server
                            </Button>
                        </DialogTrigger>
                    )}
                    <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden bg-[#050101] border-[#1a1b26] border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <DialogHeader className="border-b border-[#1a1b26] pb-4">
                            <DialogTitle className="text-white flex items-center gap-2 font-black uppercase tracking-wider">
                                {selectedServer ? "Edit MCP Server" : "New MCP Server"}
                            </DialogTitle>
                            <DialogDescription className="text-[#6272a4]">
                                {selectedServer
                                    ? "Edit the existing MCP server information."
                                    : "Fill in the information to create a new MCP server."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-hidden flex flex-col">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                                <TabsList className="bg-[#1a1b26] p-1 border-b border-[#1a1b26] rounded-none w-full justify-start">
                                    <TabsTrigger
                                        value="basic"
                                        className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] rounded-lg font-bold uppercase text-xs px-4"
                                    >
                                        <Server className="h-3 w-3 mr-2" />
                                        Basic Info
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="environments"
                                        className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] rounded-lg font-bold uppercase text-xs px-4"
                                    >
                                        <Settings className="h-3 w-3 mr-2" />
                                        Environment
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="tools"
                                        className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-[#282a36] rounded-lg font-bold uppercase text-xs px-4"
                                    >
                                        <Code className="h-3 w-3 mr-2" />
                                        Tools
                                    </TabsTrigger>
                                </TabsList>

                                <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    <TabsContent value="basic" className="space-y-4 m-0">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-[#6272a4] font-bold uppercase text-xs">
                                                Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={serverData.name}
                                                onChange={(e) => setServerData({ ...serverData, name: e.target.value })}
                                                className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl focus-visible:ring-[#bd93f9]"
                                                placeholder="MCP Server Name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-[#6272a4] font-bold uppercase text-xs">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={serverData.description}
                                                onChange={(e) => setServerData({ ...serverData, description: e.target.value })}
                                                className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl focus-visible:ring-[#bd93f9]"
                                                placeholder="MCP Server Description"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type" className="text-[#6272a4] font-bold uppercase text-xs">
                                                Type
                                            </Label>
                                            <Select
                                                value={serverData.type}
                                                onValueChange={(value) => setServerData({ ...serverData, type: value })}
                                            >
                                                <SelectTrigger id="type" className="w-full bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl">
                                                    <SelectValue placeholder="Select the type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl">
                                                    <SelectItem value="official">Official</SelectItem>
                                                    <SelectItem value="community">Community</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="config_type" className="text-[#6272a4] font-bold uppercase text-xs">
                                                Configuration Type
                                            </Label>
                                            <Select
                                                value={serverData.config_type}
                                                onValueChange={(value: "sse" | "studio") =>
                                                    setServerData({ ...serverData, config_type: value })
                                                }
                                            >
                                                <SelectTrigger id="config_type" className="w-full bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl">
                                                    <SelectValue placeholder="Select the configuration type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl">
                                                    <SelectItem value="sse">SSE (Server-Sent Events)</SelectItem>
                                                    <SelectItem value="studio">Studio</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {serverData.config_type === "sse" && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="url" className="text-[#6272a4] font-bold uppercase text-xs">
                                                        URL
                                                    </Label>
                                                    <Input
                                                        id="url"
                                                        value={serverData.url}
                                                        onChange={(e) => setServerData({ ...serverData, url: e.target.value })}
                                                        className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl focus-visible:ring-[#bd93f9]"
                                                        placeholder="https://your_server.com/sse"
                                                        required={serverData.config_type === "sse"}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <Label className="text-[#6272a4] font-bold uppercase text-xs">Headers</Label>
                                                        <Button
                                                            type="button"
                                                            onClick={handleAddHeader}
                                                            className="h-6 px-2 text-[10px] uppercase font-bold bg-[#bd93f9] text-[#282a36] hover:bg-[#ff79c6] rounded-lg"
                                                            size="sm"
                                                        >
                                                            <Plus className="mr-1 h-3 w-3 stroke-[3]" />
                                                            Add Header
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {serverData.headers.map((header, index) => (
                                                            <div key={index} className="flex gap-2 items-center">
                                                                <Input
                                                                    value={header.key}
                                                                    onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                                                                    className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl h-9"
                                                                    placeholder="Key"
                                                                />
                                                                <Input
                                                                    value={header.value}
                                                                    onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                                                                    className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl h-9"
                                                                    placeholder="Value"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveHeader(index)}
                                                                    className="text-[#ff5555] hover:bg-[#ff5555]/10 h-9 w-9 rounded-xl"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {serverData.config_type === "studio" && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="command" className="text-[#6272a4] font-bold uppercase text-xs">
                                                        Command
                                                    </Label>
                                                    <Input
                                                        id="command"
                                                        value={serverData.command}
                                                        onChange={(e) => setServerData({ ...serverData, command: e.target.value })}
                                                        className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl focus-visible:ring-[#bd93f9]"
                                                        placeholder="npx"
                                                        required={serverData.config_type === "studio"}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="args" className="text-[#6272a4] font-bold uppercase text-xs">
                                                        Arguments (one per line)
                                                    </Label>
                                                    <Textarea
                                                        id="args"
                                                        value={serverData.args}
                                                        onChange={(e) => setServerData({ ...serverData, args: e.target.value })}
                                                        className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl focus-visible:ring-[#bd93f9]"
                                                        placeholder="-y&#10;@modelcontextprotocol/server-brave-search"
                                                        required={serverData.config_type === "studio"}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="environments" className="space-y-4 m-0">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-[#f8f8f2] uppercase tracking-wide">Environment Variables</h3>
                                            <Button
                                                type="button"
                                                onClick={handleAddEnvironment}
                                                className="h-6 px-2 text-[10px] uppercase font-bold bg-[#bd93f9] text-[#282a36] hover:bg-[#ff79c6] rounded-lg"
                                                size="sm"
                                            >
                                                <Plus className="mr-1 h-3 w-3 stroke-[3]" />
                                                Add Variable
                                            </Button>
                                        </div>

                                        {serverData.environments.length === 0 ? (
                                            <div className="text-center py-8 text-[#6272a4] font-medium text-sm border-2 border-dashed border-[#1a1b26] rounded-xl bg-[#0b0b11]">
                                                No environment variables configured.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {serverData.environments.map((env, index) => (
                                                    <div key={index} className="flex gap-2 items-center">
                                                        <Input
                                                            value={env.key}
                                                            onChange={(e) => handleEnvironmentChange(index, e.target.value)}
                                                            className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-xl h-9"
                                                            placeholder="ENV_VARIABLE_NAME"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveEnvironment(index)}
                                                            className="text-[#ff5555] hover:bg-[#ff5555]/10 h-9 w-9 rounded-xl"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="tools" className="space-y-4 m-0">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-[#f8f8f2] uppercase tracking-wide">Tools</h3>
                                            <Button
                                                type="button"
                                                onClick={handleAddTool}
                                                className="h-6 px-2 text-[10px] uppercase font-bold bg-[#bd93f9] text-[#282a36] hover:bg-[#ff79c6] rounded-lg"
                                                size="sm"
                                            >
                                                <Plus className="mr-1 h-3 w-3 stroke-[3]" />
                                                Add Tool
                                            </Button>
                                        </div>

                                        {serverData.tools.length === 0 ? (
                                            <div className="text-center py-8 text-[#6272a4] font-medium text-sm border-2 border-dashed border-[#1a1b26] rounded-xl bg-[#0b0b11]">
                                                No tools configured. Click "Add Tool" to start.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {serverData.tools.map((tool, index) => (
                                                    <div key={index} className="bg-[#0b0b11] border border-[#1a1b26] rounded-xl p-3 shadow-lg relative">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveTool(index)}
                                                            className="absolute top-2 right-2 text-[#ff5555] hover:bg-[#ff5555]/10 h-7 w-7 rounded-lg"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>

                                                        <div className="space-y-3 pt-1">
                                                            <div className="space-y-1">
                                                                <Label className="text-[#6272a4] font-bold uppercase text-[10px]">Name</Label>
                                                                <Input
                                                                    value={tool.name}
                                                                    onChange={(e) => handleToolChange(index, "name", e.target.value)}
                                                                    className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-lg h-8 text-xs"
                                                                    placeholder="tool_name"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[#6272a4] font-bold uppercase text-[10px]">Description</Label>
                                                                <Textarea
                                                                    value={tool.description}
                                                                    onChange={(e) => handleToolChange(index, "description", e.target.value)}
                                                                    className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-lg text-xs min-h-[60px]"
                                                                    placeholder="Tool Description"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[#6272a4] font-bold uppercase text-[10px]">Tags</Label>
                                                                    <Input
                                                                        value={(tool.tags ?? []).join(", ")}
                                                                        onChange={(e) => handleToolChange(index, "tags", e.target.value.split(", "))}
                                                                        className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-lg h-8 text-xs"
                                                                        placeholder="tag1, tag2"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[#6272a4] font-bold uppercase text-[10px]">Examples</Label>
                                                                    <Input
                                                                        value={(tool.examples ?? []).join(", ")}
                                                                        onChange={(e) => handleToolChange(index, "examples", e.target.value.split(", "))}
                                                                        className="bg-[#1a1b26] border-[#343746] text-[#f8f8f2] rounded-lg h-8 text-xs"
                                                                        placeholder="Ex1, Ex2"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                        <DialogFooter className="pt-4 border-t border-[#1a1b26] bg-[#0b0b11] p-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="bg-[#1a1b26] hover:bg-[#ff5555] border-[#1a1b26] text-[#f8f8f2] font-bold uppercase tracking-wider rounded-xl hover:border-[#ff5555]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={(e) => handleAddServer(e)}
                                className="bg-[#50fa7b] text-[#282a36] hover:bg-[#ff79c6] font-bold uppercase tracking-wider rounded-xl border-b-4 border-[#3cbb5d] hover:border-[#bd5db8] active:border-b-0 active:translate-y-1 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : selectedServer ? "Save Changes" : "Add Server"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6272a4]" />
                <Input
                    placeholder="Search servers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-[#1a1b26] border-[#343746] text-[#f8f8f2] placeholder:text-[#6272a4] focus-visible:ring-[#bd93f9] rounded-xl h-12"
                />
            </div>

            {isLoading && mcpServers.length === 0 ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bd93f9] mx-auto"></div>
                </div>
            ) : filteredServers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServers.map((server) => (
                        <div
                            key={server.id}
                            className="bg-[#0b0b11] border border-[#1a1b26] rounded-lg overflow-hidden hover:border-[#bd93f9] transition-all duration-300 shadow-[0_0_15px_rgba(189,147,249,0.1)] hover:shadow-[0_0_20px_rgba(189,147,249,0.3)] group flex flex-col"
                        >
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-[#bd93f9] rounded flex items-center justify-center shadow-[0_0_15px_rgba(189,147,249,0.4)]">
                                        <Server size={20} className="text-black" />
                                    </div>
                                    <Badge className="bg-[#bd93f9]/20 text-[#bd93f9] border border-[#bd93f9]/30 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5">
                                        {server.type}
                                    </Badge>
                                </div>

                                <h3 className="text-[14px] font-black text-white uppercase tracking-wide mb-2 line-clamp-1">
                                    {server.name}
                                </h3>
                                <p className="text-[#6272a4] text-[10px] line-clamp-2 mb-4 font-medium h-8">
                                    {server.description || "No description provided."}
                                </p>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[9px] text-[#f8f8f2] font-mono bg-[#050101] border border-[#282a36] p-2 rounded">
                                        <Settings className="h-3 w-3 text-[#50fa7b]" />
                                        <span className="font-black text-[#6272a4] uppercase tracking-widest">CONFIG:</span>
                                        <span className="uppercase text-[#bd93f9]">{server.config_type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-[#f8f8f2] font-mono bg-[#050101] border border-[#282a36] p-2 rounded">
                                        <Code className="h-3 w-3 text-[#ff79c6]" />
                                        <span className="font-black text-[#6272a4] uppercase tracking-widest">TOOLS:</span>
                                        <span className="text-[#bd93f9]">{server.tools?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#1a1b26] p-3 flex gap-2 border-t border-[#282a36]">
                                {isAdmin ? (
                                    <>
                                        <button
                                            className="flex-1 bg-[#bd93f9] hover:bg-[#ff79c6] text-black font-black py-2 px-4 rounded transition-all shadow-[0_0_15px_rgba(189,147,249,0.3)] hover:shadow-[0_0_20px_rgba(255,121,198,0.4)] text-[10px] uppercase tracking-widest"
                                            onClick={() => handleEditServer(server)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="w-10 px-0 bg-[#ff5555] hover:bg-[#ff5555]/90 text-black rounded transition-all"
                                            onClick={() => handleDeleteServer(server)}
                                        >
                                            <Trash2 className="h-4 w-4 mx-auto" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full text-center text-[#6272a4] text-[10px] uppercase font-bold py-2">
                                        Read Only
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-[#1a1b26] rounded-3xl bg-[#0b0b11]">
                    <div className="p-4 bg-[#1a1b26] rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Server className="h-8 w-8 text-[#6272a4]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Servers Found</h3>
                    <p className="text-[#6272a4] max-w-md mx-auto mb-6">
                        {searchQuery
                            ? `No results matching "${searchQuery}"`
                            : "Get started by adding your first MCP server to extend agent capabilities."}
                    </p>
                    {isAdmin && (
                        <Button
                            onClick={() => {
                                resetForm();
                                setIsDialogOpen(true);
                            }}
                            className="bg-[#bd93f9] hover:bg-[#ff79c6] text-[#282a36] font-black uppercase tracking-wider border-b-4 border-[#8b6db5] hover:border-[#bd5db8] active:border-b-0 active:translate-y-1 transition-all rounded-xl"
                        >
                            <Plus className="mr-2 h-4 w-4 stroke-[3]" />
                            Add New Server
                        </Button>
                    )}
                </div>
            )}

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Server"
                description={`Are you sure you want to delete "${selectedServer?.name}"? This action cannot be undone.`}
                onConfirm={confirmDeleteServer}
                confirmText="Delete Server"
            />
        </div>
    );
}
