import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { X, Plus } from "lucide-react";

interface CustomMCPDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (customMCP: { url: string; headers: Record<string, string> }) => void;
    initialCustomMCP?: { url: string; headers: Record<string, string> } | null;
}

export function CustomMCPDialog({
    open,
    onOpenChange,
    onSave,
    initialCustomMCP = null,
}: CustomMCPDialogProps) {
    const [url, setUrl] = useState("");
    const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);

    useEffect(() => {
        if (open) {
            if (initialCustomMCP) {
                setUrl(initialCustomMCP.url);
                setHeaders(
                    Object.entries(initialCustomMCP.headers || {}).map(([key, value]) => ({
                        key,
                        value,
                    }))
                );
            } else {
                setUrl("");
                setHeaders([]);
            }
        }
    }, [open, initialCustomMCP]);

    const addHeader = () => {
        setHeaders([...headers, { key: "", value: "" }]);
    };

    const removeHeader = (index: number) => {
        setHeaders(headers.filter((_, i) => i !== index));
    };

    const updateHeader = (index: number, field: "key" | "value", value: string) => {
        const updated = [...headers];
        updated[index][field] = value;
        setHeaders(updated);
    };

    const handleSave = () => {
        if (!url.trim()) return;

        const headersObj: Record<string, string> = {};
        headers.forEach(({ key, value }) => {
            if (key.trim()) {
                headersObj[key] = value;
            }
        });

        onSave({ url: url.trim(), headers: headersObj });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] bg-[#0b0b11] border-[#1a1b26]">
                <DialogHeader className="border-b border-[#1a1b26] pb-4">
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(139,233,253,0.5)" }}>
                        Custom_MCP_Server
                    </DialogTitle>
                    <DialogDescription className="text-[#6272a4]">
                        Configure a custom MCP server with URL and HTTP headers.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* URL */}
                    <div className="space-y-2">
                        <Label htmlFor="custom-mcp-url" className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                            Server URL *
                        </Label>
                        <Input
                            id="custom-mcp-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/mcp"
                            className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#8be9fd] focus:ring-[#8be9fd]/20"
                        />
                    </div>

                    {/* Headers */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                                HTTP Headers
                            </Label>
                            <Button
                                type="button"
                                onClick={addHeader}
                                size="sm"
                                className="bg-[#8be9fd]/10 hover:bg-[#8be9fd]/20 text-[#8be9fd] border border-[#8be9fd]/30 h-7 text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Header
                            </Button>
                        </div>

                        {headers.length > 0 && (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {headers.map((header, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                        <Input
                                            value={header.key}
                                            onChange={(e) => updateHeader(index, "key", e.target.value)}
                                            placeholder="Header name"
                                            className="flex-1 bg-[#050101] border-[#1a1b26] text-[#f8f8f2] text-sm"
                                        />
                                        <Input
                                            value={header.value}
                                            onChange={(e) => updateHeader(index, "value", e.target.value)}
                                            placeholder="Header value"
                                            className="flex-1 bg-[#050101] border-[#1a1b26] text-[#f8f8f2] text-sm"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => removeHeader(index)}
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9 text-[#ff5555] hover:bg-[#ff5555]/10"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {headers.length === 0 && (
                            <p className="text-xs text-[#6272a4] italic">No headers configured</p>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t border-[#1a1b26] pt-4 flex-row gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-transparent border-2 border-[#ff5555] text-[#ff5555] hover:bg-[#ff5555]/10 font-bold uppercase tracking-wider"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!url.trim()}
                        className="bg-[#8be9fd] hover:bg-[#8be9fd]/80 text-[#0b0b11] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(139,233,253,0.4)] disabled:opacity-50"
                    >
                        {initialCustomMCP ? "Update" : "Add"} MCP
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
