import { useState, useEffect, memo } from "react";
import { formatFileSize, isImageFile } from "@/lib/file-utils";
import { File, FileText, Download, Image } from "lucide-react";
import type { ChatPart } from "@/types/chat";

interface InlineDataAttachmentsProps {
    parts: ChatPart[];
    className?: string;
    sessionId?: string;
}

interface ProcessedFile {
    filename: string;
    content_type: string;
    data: string;
    size: number;
    preview_url?: string;
}

const InlineDataAttachmentsComponent = ({ parts, className = "" }: InlineDataAttachmentsProps) => {
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [isProcessed, setIsProcessed] = useState(false);

    useEffect(() => {
        if (isProcessed) return;

        const validParts = parts.filter(part => part.inline_data && part.inline_data.data);

        if (validParts.length === 0) {
            setIsProcessed(true);
            return;
        }

        const files = validParts.map((part, index) => {
            const { mime_type, data } = part.inline_data!;
            const extension = mime_type.split('/')[1] || 'file';

            let filename = '';

            if (part.inline_data?.metadata?.filename) {
                filename = part.inline_data.metadata.filename;
            }
            else if (part.file_data?.filename) {
                filename = part.file_data.filename;
            }
            else {
                filename = `media_${index + 1}.${extension}`;
            }

            let preview_url = undefined;
            // Handle base64 data correctly for preview
            if (data && isImageFile(mime_type)) {
                preview_url = data.startsWith('data:')
                    ? data
                    : `data:${mime_type};base64,${data}`;
            }

            const fileData: ProcessedFile = {
                filename,
                content_type: mime_type,
                size: data.length,
                data,
                preview_url
            };

            return fileData;
        });

        setProcessedFiles(files);
        setIsProcessed(true);
    }, [parts, isProcessed]);

    if (processedFiles.length === 0) return null;

    const downloadFile = (file: ProcessedFile) => {
        try {
            const link = document.createElement("a");
            const dataUrl = file.data.startsWith('data:')
                ? file.data
                : `data:${file.content_type};base64,${file.data}`;

            link.href = dataUrl;
            link.download = file.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error(`Error downloading file ${file.filename}:`, error);
        }
    };

    const getFileUrl = (file: ProcessedFile) => {
        return file.preview_url || (file.data.startsWith('data:')
            ? file.data
            : `data:${file.content_type};base64,${file.data}`);
    };

    return (
        <div className={`flex flex-col gap-2 mt-2 ${className}`}>
            <div className="text-xs text-[#6272a4] mb-1 font-bold">
                <span>Attached files:</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {processedFiles.map((file, index) => (
                    <div
                        key={index}
                        className="flex flex-col bg-[#0b0b11] rounded-lg overflow-hidden border-2 border-[#1a1b26] hover:border-[#6272a4] hover:scale-[1.02] transition-all shadow-neu-sm"
                    >
                        {isImageFile(file.content_type) && (
                            <div className="w-full max-w-[200px] h-[120px] bg-[#050101] flex items-center justify-center border-b-2 border-[#1a1b26]">
                                <img
                                    src={getFileUrl(file)}
                                    alt={file.filename}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        console.error(`Error loading image ${file.filename}`);
                                        // Fallback to placeholder or icon
                                        (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1pbWFnZS1vZmYiPjxsaW5lIHgxPSIyIiB5MT0iMiIgeDI9IjIyIiB5Mj0iMjIiLz48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHg9IjIiIHk9IjIiIHJ4PSIyIiByeT0iMiIvPjxsaW5lIHgxPSI4IiB5MT0iMTAiIHgyPSI4IiB5Mj0iMTAiLz48bGluZSB4MT0iMTIiIHkxPSIxNCIgeDI9IjEyIiB5Mj0iMTQiLz48L3N2Zz4=";
                                    }}
                                />
                            </div>
                        )}
                        <div className="p-3 flex items-center gap-3">
                            <div className="flex-shrink-0">
                                {isImageFile(file.content_type) ? (
                                    <Image className="h-4 w-4 text-[#50fa7b]" />
                                ) : file.content_type === "application/pdf" ? (
                                    <FileText className="h-4 w-4 text-[#ff5555]" />
                                ) : (
                                    <File className="h-4 w-4 text-[#8be9fd]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-black text-white truncate max-w-[150px]">
                                    {file.filename}
                                </div>
                                <div className="text-[10px] text-[#6272a4] font-mono">
                                    {formatFileSize(file.size)}
                                </div>
                            </div>
                            <button
                                onClick={() => downloadFile(file)}
                                className="text-[#bd93f9] hover:text-[#ff79c6] transition-colors p-1 hover:bg-[#bd93f9]/10 rounded"
                                title="Download"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Memoized export
export const InlineDataAttachments = memo(InlineDataAttachmentsComponent);
