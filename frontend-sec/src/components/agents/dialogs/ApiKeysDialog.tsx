import { Badge } from "@/components/ui/badge";
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
import { ConfirmationDialog } from "./ConfirmationDialog";
import { type ApiKey, getApiKeyValue } from "@/services/agentService";
import { Edit, Eye, Key, Plus, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { availableModelProviders } from "@/types/aiModels";

interface ExtendedApiKey extends ApiKey {
    key_value?: string;
    original_key_value?: string;
}

interface ApiKeysDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apiKeys: ApiKey[];
    isLoading: boolean;
    clientId: string;
    onAddApiKey: (apiKey: {
        name: string;
        provider: string;
        key_value: string;
    }) => Promise<void>;
    onUpdateApiKey: (
        id: string,
        apiKey: {
            name: string;
            provider: string;
            key_value?: string;
            is_active: boolean;
        }
    ) => Promise<void>;
    onDeleteApiKey: (id: string) => Promise<void>;
}

export function ApiKeysDialog({
    open,
    onOpenChange,
    apiKeys,
    isLoading,
    clientId,
    onAddApiKey,
    onUpdateApiKey,
    onDeleteApiKey,
}: ApiKeysDialogProps) {
    const [isAddingApiKey, setIsAddingApiKey] = useState(false);
    const [isEditingApiKey, setIsEditingApiKey] = useState(false);
    const [currentApiKey, setCurrentApiKey] = useState<Partial<ExtendedApiKey>>({});

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [apiKeyToDelete, setApiKeyToDelete] = useState<ApiKey | null>(null);
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

    useEffect(() => {
        if (isAddingApiKey) {
            setIsApiKeyVisible(false);
        }
    }, [isAddingApiKey]);

    const handleAddClick = () => {
        setCurrentApiKey({});
        setIsAddingApiKey(true);
        setIsEditingApiKey(false);
    };

    const handleEditClick = (apiKey: ApiKey) => {
        setCurrentApiKey({
            ...apiKey,
            key_value: "*****",
            original_key_value: undefined
        });
        setIsAddingApiKey(true);
        setIsEditingApiKey(true);
        setIsApiKeyVisible(false);
    };

    const toggleApiKeyVisibility = async () => {
        if (!isApiKeyVisible && currentApiKey.id && !currentApiKey.original_key_value) {
            try {
                const response = await getApiKeyValue(currentApiKey.id, clientId);
                setCurrentApiKey({
                    ...currentApiKey,
                    original_key_value: response.data.key_value
                });
            } catch (error: any) {
                console.error('Error fetching API key:', error);
                if (error?.response?.status === 401) {
                    window.location.href = '/login?session_expired=true';
                    return;
                }
            }
        }
        setIsApiKeyVisible(!isApiKeyVisible);
    };

    const handleDeleteClick = (apiKey: ApiKey) => {
        setApiKeyToDelete(apiKey);
        setIsDeleteDialogOpen(true);
    };

    const handleSaveApiKey = async () => {
        if (
            !currentApiKey.name ||
            !currentApiKey.provider ||
            (!isEditingApiKey && !currentApiKey.key_value)
        ) {
            return;
        }

        try {
            if (currentApiKey.id) {
                await onUpdateApiKey(currentApiKey.id, {
                    name: currentApiKey.name,
                    provider: currentApiKey.provider,
                    key_value: currentApiKey.key_value,
                    is_active: currentApiKey.is_active !== false,
                });
            } else {
                await onAddApiKey({
                    name: currentApiKey.name,
                    provider: currentApiKey.provider,
                    key_value: currentApiKey.key_value!,
                });
            }

            setCurrentApiKey({});
            setIsAddingApiKey(false);
            setIsEditingApiKey(false);
        } catch (error) {
            console.error("Error saving API key:", error);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!apiKeyToDelete) return;

        try {
            await onDeleteApiKey(apiKeyToDelete.id);
            setApiKeyToDelete(null);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting API key:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[85vh] bg-[#0b0b11] border-2 border-[#1a1b26] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-0">
                <DialogHeader className="border-b border-[#1a1b26] px-6 py-4">
                    <DialogTitle
                        className="text-2xl font-black text-white uppercase tracking-widest"
                        style={{ textShadow: "0 0 10px rgba(80, 250, 123, 0.5)" }}
                    >
                        Manage_API_Keys
                    </DialogTitle>
                    <DialogDescription className="text-[#6272a4] text-xs font-mono uppercase tracking-widest mt-1">
                        Securely store and manage credentials for AI providers.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                    {isAddingApiKey ? (
                        <div className="space-y-6 bg-[#050101] border-2 border-[#1a1b26] rounded-xl p-6 shadow-neu-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-black text-[#50fa7b] uppercase tracking-widest flex items-center gap-2">
                                    <Key className="h-4 w-4" />
                                    {isEditingApiKey ? "Edit_Key" : "New_Key"}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsAddingApiKey(false);
                                        setIsEditingApiKey(false);
                                        setCurrentApiKey({});
                                    }}
                                    className="text-[#6272a4] hover:text-[#ff5555]"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black text-[#6272a4] uppercase tracking-widest">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={currentApiKey.name || ""}
                                        onChange={(e) =>
                                            setCurrentApiKey({ ...currentApiKey, name: e.target.value })
                                        }
                                        className="bg-[#1a1b26] border-2 border-[#1a1b26] text-[#f8f8f2] focus:border-[#50fa7b] focus:shadow-neu-green h-10 rounded-lg"
                                        placeholder="e.g. OpenAI GPT-4"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="provider" className="text-[10px] font-black text-[#6272a4] uppercase tracking-widest">
                                        Provider
                                    </Label>
                                    <Select
                                        value={currentApiKey.provider}
                                        onValueChange={(value) =>
                                            setCurrentApiKey({ ...currentApiKey, provider: value })
                                        }
                                    >
                                        <SelectTrigger className="bg-[#1a1b26] border-2 border-[#1a1b26] text-[#f8f8f2] focus:ring-0 focus:border-[#50fa7b] h-10 rounded-lg">
                                            <SelectValue placeholder="Select Provider" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0b0b11] border-2 border-[#1a1b26] text-[#f8f8f2]">
                                            {availableModelProviders.map((provider) => (
                                                <SelectItem
                                                    key={provider.value}
                                                    value={provider.value}
                                                    className="text-xs focus:bg-[#50fa7b] focus:text-black font-bold cursor-pointer my-1 rounded-md"
                                                >
                                                    {provider.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="key_value" className="text-[10px] font-black text-[#6272a4] uppercase tracking-widest">
                                        Key Value
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="key_value"
                                            value={
                                                isApiKeyVisible
                                                    ? (currentApiKey.original_key_value || currentApiKey.key_value || "")
                                                    : (currentApiKey.key_value && currentApiKey.key_value !== "*****" ? "*****" : currentApiKey.key_value || "")
                                            }
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                if (!isApiKeyVisible && currentApiKey.key_value === "*****" && newValue !== "*****") {
                                                    setCurrentApiKey({ ...currentApiKey, key_value: newValue });
                                                } else {
                                                    setCurrentApiKey({ ...currentApiKey, key_value: newValue });
                                                }
                                            }}
                                            className="bg-[#1a1b26] border-2 border-[#1a1b26] text-[#f8f8f2] focus:border-[#50fa7b] focus:shadow-neu-green h-10 rounded-lg pr-10"
                                            type="text"
                                            placeholder={isEditingApiKey ? "Leave blank to keep current" : "sk-..."}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6272a4] hover:text-[#50fa7b] transition-colors"
                                            onClick={toggleApiKeyVisibility}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {isEditingApiKey && (
                                    <div className="flex items-center space-x-2 bg-[#1a1b26] p-3 rounded-lg border-2 border-[#1a1b26]">
                                        <Checkbox
                                            id="is_active"
                                            checked={currentApiKey.is_active !== false}
                                            onCheckedChange={(checked) =>
                                                setCurrentApiKey({ ...currentApiKey, is_active: !!checked })
                                            }
                                            className="data-[state=checked]:bg-[#50fa7b] data-[state=checked]:text-black border-[#6272a4]"
                                        />
                                        <Label htmlFor="is_active" className="text-xs font-bold text-white cursor-pointer">
                                            Activate Key
                                        </Label>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-[#1a1b26]">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingApiKey(false);
                                        setIsEditingApiKey(false);
                                        setCurrentApiKey({});
                                    }}
                                    className="bg-transparent text-[#ff5555] font-black uppercase tracking-wider border-2 border-[#ff5555] border-b-4 hover:bg-[#ff5555]/10 active:border-b-2 active:translate-y-1 transition-all h-10 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveApiKey}
                                    className="bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : isEditingApiKey ? "Update Key" : "Save Key"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-[#050101] p-4 rounded-xl border-2 border-[#1a1b26] shadow-neu-sm">
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                        Available Keys
                                    </h3>
                                    <p className="text-[10px] text-[#6272a4] font-mono mt-1">
                                        {apiKeys.length} keys registered
                                    </p>
                                </div>
                                <Button
                                    onClick={handleAddClick}
                                    className="bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                                >
                                    <Plus className="mr-2 h-4 w-4 stroke-[3]" />
                                    Add_Key
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#50fa7b]"></div>
                                </div>
                            ) : apiKeys.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {apiKeys.map((apiKey) => (
                                        <div
                                            key={apiKey.id}
                                            className="flex items-center justify-between p-4 bg-[#1a1b26] rounded-xl border-2 border-[#050101] hover:border-[#6272a4] transition-all group shadow-md"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-white text-sm">{apiKey.name}</span>
                                                    {!apiKey.is_active && (
                                                        <Badge className="bg-[#ff5555] text-white border-[#ff5555] text-[10px] h-5">Inactive</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-[#050101] text-[#8be9fd] border-[#8be9fd] font-bold text-[10px]"
                                                    >
                                                        {apiKey.provider.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-[10px] text-[#6272a4] font-mono">
                                                        {new Date(apiKey.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(apiKey)}
                                                    className="h-8 w-8 p-0 text-[#8be9fd] hover:bg-[#8be9fd]/10 rounded-lg"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(apiKey)}
                                                    className="h-8 w-8 p-0 text-[#ff5555] hover:bg-[#ff5555]/10 rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-[#6272a4] rounded-xl bg-[#1a1b26]/50">
                                    <Key className="mx-auto h-12 w-12 text-[#6272a4] mb-4 opacity-50" />
                                    <p className="text-[#6272a4] font-black uppercase tracking-widest text-xs mb-1">
                                        No keys found
                                    </p>
                                    <p className="text-[#6272a4] text-xs opacity-70">
                                        Add your first API key to get started.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t-2 border-[#1a1b26] px-6 py-4 bg-[#0b0b11]">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto bg-transparent text-[#6272a4] font-black uppercase tracking-wider border-2 border-[#6272a4] border-b-4 hover:bg-[#6272a4]/10 active:border-b-2 active:translate-y-1 transition-all h-11 rounded-xl"
                    >
                        Close Manager
                    </Button>
                </DialogFooter>
            </DialogContent>

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Confirm Delete"
                description={`Permanently delete "${apiKeyToDelete?.name}"? Agents using this key will fail.`}
                confirmText="Yes, Delete Key"
                confirmVariant="destructive"
                onConfirm={handleDeleteConfirm}
            />
        </Dialog>
    );
}
