import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type FileData, fileToBase64 } from "@/lib/file-utils";

interface ChatInputProps {
    onSendMessage: (message: string, files?: FileData[]) => void;
    isLoading: boolean;
    placeholder?: string;
    autoFocus?: boolean;
}

export function ChatInput({
    onSendMessage,
    isLoading,
    placeholder = "Type your message...",
    autoFocus = true,
}: ChatInputProps) {
    const [input, setInput] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<FileData[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus && textareaRef.current && !isLoading) {
            textareaRef.current.focus();
        }
    }, [autoFocus, isLoading]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        autoResize(e.target);
    };

    const autoResize = (element: HTMLTextAreaElement) => {
        element.style.height = "auto";
        element.style.height = `${element.scrollHeight}px`;
        if (element.value === "") {
            element.style.height = "40px";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const filePromises = Array.from(files).map(async (file) => {
            const base64Data = await fileToBase64(file);
            return {
                filename: file.name,
                content_type: file.type,
                size: file.size,
                data: base64Data,
            };
        });

        const newFiles = await Promise.all(filePromises);
        setAttachedFiles((prev) => [...prev, ...newFiles]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = () => {
        if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;
        onSendMessage(input, attachedFiles.length > 0 ? attachedFiles : undefined);
        setInput("");
        setAttachedFiles([]);
        if (textareaRef.current) {
            textareaRef.current.style.height = "40px";
        }
    };

    return (
        <div className="space-y-2">
            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-[#1a1b26] border border-[#282a36] rounded-lg px-3 py-1.5 text-xs"
                        >
                            <Paperclip className="h-3 w-3 text-[#bd93f9]" />
                            <span className="text-[#f8f8f2] max-w-[150px] truncate">{file.filename}</span>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-[#ff5555] hover:text-[#ff5555]/80"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2 items-end bg-[#050101] border-2 border-[#1a1b26] rounded-xl p-2 shadow-neu-sm transition-all focus-within:border-[#50fa7b] focus-within:shadow-neu-green">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="h-10 w-10 p-0 bg-[#1a1b26] hover:bg-[#bd93f9] text-[#6272a4] hover:text-black rounded-lg flex-shrink-0 transition-all"
                >
                    <Paperclip className="h-5 w-5" />
                </Button>
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-[#f8f8f2] placeholder-[#6272a4] outline-none border-none resize-none p-2 max-h-[200px] overflow-y-auto text-sm font-medium leading-relaxed custom-scrollbar min-h-[40px]"
                    rows={1}
                />
                <Button
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                    className={`h-10 w-10 p-0 rounded-lg flex-shrink-0 border-b-4 active:border-b-0 active:translate-y-1 transition-all ${!input.trim() && attachedFiles.length === 0 || isLoading
                        ? "bg-[#1a1b26] text-[#6272a4] border-[#0b0b11]"
                        : "bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] border-[#2aa34a] hover:border-[#2aa34a] shadow-lg"
                        }`}
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5 stroke-[2.5]" />
                    )}
                </Button>
            </div>
        </div>
    );
}
