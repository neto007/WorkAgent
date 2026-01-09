import { useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Save, Upload, Loader2, X } from "lucide-react";
import { uploadAvatar } from '@/services/uploadService';
import { AgentType } from "@/types/agent";
import type { Agent } from "@/types/agent";
import { availableModels, availableModelProviders } from '@/types/aiModels';
import type { ApiKey } from "@/services/agentService";

interface BasicInfoTabProps {
    values: Partial<Agent>;
    onChange: (values: Partial<Agent>) => void;
    errors?: Record<string, string>;
    isSubmitting?: boolean;
    apiKeys?: ApiKey[];
}

export function BasicInfoTab({ values, onChange, errors = {}, isSubmitting = false, apiKeys = [] }: BasicInfoTabProps) {
    const [instructionText, setInstructionText] = useState(values.instruction || "");
    const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
    const [expandedInstructionText, setExpandedInstructionText] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if SVG or image
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        setIsUploading(true);
        try {
            const url = await uploadAvatar(file);
            handleChange('avatar_url', url);
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            alert('Failed to upload avatar. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };


    const handleChange = (field: string, value: any) => {
        onChange({ ...values, [field]: value });
    };

    const handleTypeChange = (type: AgentType) => {
        const newValues: Partial<Agent> = {
            ...values,
            type,
        };

        // Initialize workflow structure when type is workflow
        if (type === AgentType.WORKFLOW) {
            newValues.config = {
                ...values.config,
                workflow: {
                    nodes: [],
                    edges: [],
                },
            };
        }

        onChange(newValues);
    };

    const handleInstructionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setInstructionText(newValue);
        onChange({
            ...values,
            instruction: newValue,
        });
    };

    const handleExpandInstruction = () => {
        setExpandedInstructionText(instructionText);
        setIsInstructionModalOpen(true);
    };

    const handleSaveExpandedInstruction = () => {
        setInstructionText(expandedInstructionText);
        onChange({
            ...values,
            instruction: expandedInstructionText,
        });
        setIsInstructionModalOpen(false);
    };

    const selectedType = values.type || AgentType.LLM;

    return (
        <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                    Name *
                </Label>
                <Input
                    id="name"
                    value={values.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="My Agent"
                    disabled={isSubmitting}
                    className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#bd93f9] focus:ring-[#bd93f9]/20"
                />
                {errors.name && <p className="text-xs text-[#ff5555] font-mono">{errors.name}</p>}
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
                <Label htmlFor="avatar_url" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                    Avatar (URL or Upload SVG)
                </Label>
                <div className="flex gap-3 items-start">
                    {/* Preview */}
                    <div className="relative group shrink-0">
                        {values.avatar_url ? (
                            <>
                                <img
                                    src={values.avatar_url}
                                    alt="Preview"
                                    className="w-10 h-10 rounded-full object-cover border border-[#bd93f9] bg-[#1a1b26]"
                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                />
                                <button
                                    onClick={() => handleChange('avatar_url', '')}
                                    className="absolute -top-1 -right-1 bg-[#ff5555] text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={10} />
                                </button>
                            </>
                        ) : (
                            <div className="w-10 h-10 rounded-full border border-dashed border-[#6272a4] flex items-center justify-center bg-[#1a1b26]">
                                <span className="text-[10px] text-[#6272a4]">?</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex gap-2">
                        {/* URL Input */}
                        <Input
                            id="avatar_url"
                            value={values.avatar_url || ''}
                            onChange={(e) => handleChange('avatar_url', e.target.value)}
                            placeholder="https://example.com/avatar.png"
                            disabled={isSubmitting || isUploading}
                            className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#bd93f9] focus:ring-[#bd93f9]/20 flex-1"
                        />

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/svg+xml,image/png,image/jpeg"
                            onChange={handleFileUpload}
                        />

                        {/* Upload Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSubmitting || isUploading}
                            className="border-[#bd93f9] text-[#bd93f9] hover:bg-[#bd93f9]/10"
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                    Description
                </Label>
                <Textarea
                    id="description"
                    value={values.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Agent description..."
                    disabled={isSubmitting}
                    rows={3}
                    className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#bd93f9] focus:ring-[#bd93f9]/20 resize-none"
                />
            </div>

            {/* Agent Type */}
            <div className="space-y-2">
                <Label htmlFor="type" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                    Agent Type *
                </Label>
                <Select
                    disabled={isSubmitting}
                    onValueChange={(value) => handleTypeChange(value as AgentType)}
                    value={values.type}
                >
                    <SelectTrigger className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] focus:ring-[#bd93f9]/20">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b0b11] border-[#1a1b26]">
                        <SelectItem value={AgentType.LLM} className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9]">
                            LLM
                        </SelectItem>
                        <SelectItem value={AgentType.A2A} className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9]">
                            A2A (Agent-to-Agent)
                        </SelectItem>
                        <SelectItem value={AgentType.SEQUENTIAL} className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9]">
                            Sequential
                        </SelectItem>
                        <SelectItem value={AgentType.PARALLEL} className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9]">
                            Parallel
                        </SelectItem>
                        <SelectItem value={AgentType.LOOP} className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9]">
                            Loop
                        </SelectItem>
                        <SelectItem value={AgentType.WORKFLOW} className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9]">
                            Workflow
                        </SelectItem>
                        <SelectItem value={AgentType.TASK} className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9]">
                            Task
                        </SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-[#ff5555] font-mono">{errors.type}</p>}
            </div>

            {/* LLM Specific Fields */}
            {selectedType === AgentType.LLM && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                            Role
                        </Label>
                        <Input
                            id="role"
                            value={values.role || ''}
                            onChange={(e) => handleChange('role', e.target.value)}
                            placeholder="Ex: Research Assistant, Customer Support, etc."
                            disabled={isSubmitting}
                            className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#bd93f9] focus:ring-[#bd93f9]/20"
                        />
                        <div className="flex items-center text-[10px] text-[#6272a4] gap-1">
                            <span className="inline-block">ℹ️</span>
                            <span>Define the role or persona that the agent will assume</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="goal" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                            Goal
                        </Label>
                        <Input
                            id="goal"
                            value={values.goal || ''}
                            onChange={(e) => handleChange('goal', e.target.value)}
                            placeholder="Ex: Find and organize information, Assist customers with inquiries, etc."
                            disabled={isSubmitting}
                            className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#bd93f9] focus:ring-[#bd93f9]/20"
                        />
                        <div className="flex items-center text-[10px] text-[#6272a4] gap-1">
                            <span className="inline-block">ℹ️</span>
                            <span>Define the main objective or purpose of this agent</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                            API Key
                        </Label>
                        <Select
                            disabled={isSubmitting}
                            value={values.api_key_id || ""}
                            onValueChange={(value) => handleChange('api_key_id', value)}
                        >
                            <SelectTrigger className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] focus:ring-[#bd93f9]/20">
                                <SelectValue placeholder="Select an API key" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0b0b11] border-[#1a1b26]">
                                {apiKeys && apiKeys.length > 0 ? (
                                    apiKeys
                                        .filter((key) => key.is_active !== false)
                                        .map((key) => (
                                            <SelectItem
                                                key={key.id}
                                                value={key.id}
                                                className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9] pl-6 cursor-pointer"
                                            >
                                                <div className="flex items-center">
                                                    <span>{key.name}</span>
                                                    <span className="ml-2 text-xs text-[#6272a4] bg-[#1a1b26] px-1 rounded">
                                                        {key.provider}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))
                                ) : (
                                    <div className="text-[#6272a4] px-2 py-1.5 pl-8 text-xs">
                                        No API keys available
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                        {apiKeys && apiKeys.length === 0 && (
                            <p className="text-[10px] text-[#ff5555] uppercase tracking-wider mt-1">
                                No API keys found. Please create one first.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="model" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                            Model *
                        </Label>
                        <Select
                            disabled={isSubmitting}
                            onValueChange={(value) => handleChange('model', value)}
                            value={values.model}
                        >
                            <SelectTrigger className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] focus:ring-[#bd93f9]/20">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0b0b11] border-[#1a1b26] max-h-[300px]">
                                {availableModelProviders
                                    .filter(provider => {
                                        const selectedApiKey = apiKeys.find(k => k.id === values.api_key_id);
                                        return !selectedApiKey || selectedApiKey.provider === provider.value;
                                    })
                                    .map((provider) => (
                                        <SelectGroup key={provider.value}>
                                            <SelectLabel className="text-[#bd93f9] uppercase text-xs pt-2 font-bold px-2">
                                                {provider.label}
                                            </SelectLabel>
                                            {availableModels
                                                .filter((m) => m.provider === provider.value)
                                                .map((model) => (
                                                    <SelectItem
                                                        key={model.value}
                                                        value={model.value}
                                                        className="text-[#f8f8f2] focus:bg-[#bd93f9]/20 focus:text-[#bd93f9] pl-6 cursor-pointer"
                                                    >
                                                        {model.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectGroup>
                                    ))}
                            </SelectContent>
                        </Select>
                        {errors.model && <p className="text-xs text-[#ff5555] font-mono">{errors.model}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="temperature" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                            Temperature: {values.config?.temperature ?? 0.7}
                        </Label>
                        <Input
                            id="temperature"
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={values.config?.temperature ?? 0.7}
                            onChange={(e) => onChange({
                                ...values,
                                config: { ...values.config, temperature: parseFloat(e.target.value) }
                            })}
                            disabled={isSubmitting}
                            className="w-full accent-[#bd93f9]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instruction" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                            System Prompt
                        </Label>
                        <div className="relative">
                            <Textarea
                                id="instruction"
                                value={instructionText}
                                onChange={handleInstructionChange}
                                placeholder="You are a helpful assistant..."
                                disabled={isSubmitting}
                                rows={5}
                                onClick={handleExpandInstruction}
                                className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#bd93f9] focus:ring-[#bd93f9]/20 resize-none font-mono text-sm pr-10"
                            />
                            <button
                                type="button"
                                className="absolute top-3 right-3 text-[#6272a4] hover:text-[#bd93f9] focus:outline-none transition-colors"
                                onClick={handleExpandInstruction}
                            >
                                <Maximize2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex items-center text-[10px] text-[#6272a4] gap-1">
                            <span className="inline-block">ℹ️</span>
                            <span>
                                Characters like {"{"}  and {"}"} are automatically escaped.
                                <span className="ml-2 text-[#bd93f9]">Click to expand editor.</span>
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Expanded Instruction Modal */}
            <Dialog open={isInstructionModalOpen} onOpenChange={setIsInstructionModalOpen}>
                <DialogContent className="max-w-[1200px] max-h-[90vh] bg-[#0b0b11] border-[#1a1b26] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-[#f8f8f2] font-black text-xl uppercase tracking-wider">Agent Instructions</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col min-h-[60vh]">
                        <Textarea
                            value={expandedInstructionText}
                            onChange={(e) => setExpandedInstructionText(e.target.value)}
                            className="flex-1 min-h-full bg-[#050101] border-[#1a1b26] text-[#f8f8f2] p-4 focus:border-[#bd93f9] focus:ring-[#bd93f9]/20 resize-none font-mono"
                            placeholder="Enter detailed instructions for the agent..."
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsInstructionModalOpen(false)}
                            className="bg-transparent text-[#ff5555] font-black uppercase tracking-wider border-2 border-[#ff5555] border-b-4 hover:bg-[#ff5555]/10 active:border-b-2 active:translate-y-1 transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveExpandedInstruction}
                            className="bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Instructions
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
