import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send, Paperclip, X, FileText, Image, File } from "lucide-react";
import { toast } from "sonner";

interface AttachedFile {
    name: string;
    type: string;
    size: number;
    base64: string;
}

interface StreamLabFormProps {
    agentUrl: string;
    setAgentUrl: (url: string) => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    message: string;
    setMessage: (message: string) => void;
    sessionId: string;
    setSessionId: (id: string) => void;
    taskId: string;
    setTaskId: (id: string) => void;
    callId: string;
    setCallId: (id: string) => void;
    sendStreamRequest: () => Promise<void>;
    isStreaming: boolean;
    streamResponse: string;
    streamStatus: string;
    streamHistory: string[];
    renderStatusIndicator: () => React.ReactNode;
    renderTypingIndicator: () => React.ReactNode;
    setFiles?: (files: AttachedFile[]) => void;
    authMethod: string;
    currentTaskId?: string | null;
}

export function StreamLabForm({
    agentUrl,
    setAgentUrl,
    apiKey,
    setApiKey,
    message,
    setMessage,
    sessionId,
    setSessionId,
    taskId,
    setTaskId,
    callId,
    setCallId,
    sendStreamRequest,
    isStreaming,
    streamResponse,
    renderStatusIndicator,
    renderTypingIndicator,
    setFiles = () => { },
    authMethod,
    currentTaskId
}: StreamLabFormProps) {
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const clearAttachedFiles = () => {
        setAttachedFiles([]);
    };

    const handleSendStreamRequest = async () => {
        await sendStreamRequest();
        clearAttachedFiles();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const maxFileSize = 5 * 1024 * 1024; // 5MB limit
        const newFiles = Array.from(e.target.files);

        if (attachedFiles.length + newFiles.length > 5) {
            toast.error("File limit exceeded", {
                description: "You can only attach up to 5 files."
            });
            return;
        }

        const filesToAdd: AttachedFile[] = [];

        for (const file of newFiles) {
            if (file.size > maxFileSize) {
                toast.error("File too large", {
                    description: `The file ${file.name} exceeds the 5MB size limit.`
                });
                continue;
            }

            try {
                const base64 = await readFileAsBase64(file);
                filesToAdd.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    base64: base64
                });
            } catch (error) {
                console.error("Failed to read file:", error);
                toast.error("Failed to read file", {
                    description: `Could not process ${file.name}.`
                });
            }
        }

        if (filesToAdd.length > 0) {
            const updatedFiles = [...attachedFiles, ...filesToAdd];
            setAttachedFiles(updatedFiles);
            setFiles(updatedFiles);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1]; // Remove data URL prefix
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (index: number) => {
        const updatedFiles = attachedFiles.filter((_, i) => i !== index);
        setAttachedFiles(updatedFiles);
        setFiles(updatedFiles);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isImageFile = (type: string): boolean => {
        return type.startsWith('image/');
    };

    return (
        <div className="space-y-4">
            {/* A2A Streaming Information */}
            <div className="p-4 bg-[#282a36] border border-[#bd93f9]/20 rounded-md">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#50fa7b]">A2A Streaming Mode</span>
                    <span className="text-xs text-[#f8f8f2]/60">Method: message/stream</span>
                </div>
                <div className="text-xs text-[#f8f8f2]/60">
                    Authentication: {authMethod === "bearer" ? "Bearer Token" : "API Key"} header
                </div>
                {currentTaskId && (
                    <div className="mt-2 pt-2 border-t border-[#bd93f9]/20">
                        <span className="text-xs text-[#f8f8f2]/60">Current Task ID: </span>
                        <span className="text-xs text-[#50fa7b] font-mono">{currentTaskId}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-[#f8f8f2]/60 mb-1 block">Agent URL</label>
                    <Input
                        value={agentUrl}
                        onChange={(e) => setAgentUrl(e.target.value)}
                        placeholder="http://localhost:8000/api/v1/a2a/your-agent-id"
                        className="bg-[#44475a]/30 border-[#44475a] text-[#f8f8f2]"
                        disabled={isStreaming}
                    />
                </div>
                <div>
                    <label className="text-sm text-[#f8f8f2]/60 mb-1 block">
                        {authMethod === "bearer" ? "Bearer Token" : "API Key"} (optional)
                    </label>
                    <Input
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={authMethod === "bearer" ? "Your Bearer token" : "Your API key"}
                        className="bg-[#44475a]/30 border-[#44475a] text-[#f8f8f2]"
                        disabled={isStreaming}
                    />
                </div>
            </div>

            <div>
                <label className="text-sm text-[#f8f8f2]/60 mb-1 block">Message</label>
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What is the A2A protocol?"
                    className="bg-[#44475a]/30 border-[#44475a] text-[#f8f8f2] min-h-[100px]"
                    disabled={isStreaming}
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-[#f8f8f2]/60">
                        Attach Files (up to 5, max 5MB each)
                    </label>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#44475a]/30 border-[#44475a] text-[#f8f8f2]/60 hover:bg-[#6272a4]/50 hover:text-[#f8f8f2]"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={attachedFiles.length >= 5 || isStreaming}
                    >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Browse Files
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileSelect}
                        disabled={isStreaming}
                    />
                </div>

                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {attachedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1.5 bg-[#44475a]/50 text-[#f8f8f2] rounded-md p-1.5 text-xs"
                            >
                                {isImageFile(file.type) ? (
                                    <Image className="h-4 w-4 text-[#50fa7b]" />
                                ) : file.type === 'application/pdf' ? (
                                    <FileText className="h-4 w-4 text-[#50fa7b]" />
                                ) : (
                                    <File className="h-4 w-4 text-[#50fa7b]" />
                                )}
                                <span className="max-w-[150px] truncate">{file.name}</span>
                                <span className="text-[#f8f8f2]/60">({formatFileSize(file.size)})</span>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="ml-1 text-[#f8f8f2]/60 hover:text-[#f8f8f2] transition-colors"
                                    disabled={isStreaming}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Separator className="my-4 bg-[#bd93f9]/20" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm text-[#f8f8f2]/60 mb-1 block">Session ID</label>
                    <Input
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        className="bg-[#44475a]/30 border-[#44475a] text-[#f8f8f2]"
                        disabled={isStreaming}
                    />
                </div>
                <div>
                    <label className="text-sm text-[#f8f8f2]/60 mb-1 block">Task ID</label>
                    <Input
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                        className="bg-[#44475a]/30 border-[#44475a] text-[#f8f8f2]"
                        disabled={isStreaming}
                    />
                </div>
                <div>
                    <label className="text-sm text-[#f8f8f2]/60 mb-1 block">Call ID</label>
                    <Input
                        value={callId}
                        onChange={(e) => setCallId(e.target.value)}
                        className="bg-[#44475a]/30 border-[#44475a] text-[#f8f8f2]"
                        disabled={isStreaming}
                    />
                </div>
            </div>

            <Button
                onClick={handleSendStreamRequest}
                disabled={isStreaming}
                className="bg-[#50fa7b] text-black hover:bg-[#50fa7b]/80 w-full mt-4"
            >
                {isStreaming ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                        Streaming...
                    </div>
                ) : (
                    <div className="flex items-center">
                        <Send className="mr-2 h-4 w-4" />
                        Start Streaming
                    </div>
                )}
            </Button>

            {streamResponse && (
                <div className="mt-6 rounded-md bg-[#282a36] border border-[#bd93f9]/20 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-[#f8f8f2]">Response</h3>
                        {renderStatusIndicator && renderStatusIndicator()}
                    </div>
                    <div className="whitespace-pre-wrap text-sm font-mono text-[#f8f8f2]/80">
                        {streamResponse}
                    </div>
                    {renderTypingIndicator && renderTypingIndicator()}
                </div>
            )}
        </div>
    );
}
