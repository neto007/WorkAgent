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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CustomToolDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (tool: any) => void;
    initialTool?: any;
}

export function CustomToolDialog({
    open,
    onOpenChange,
    onSave,
    initialTool = null,
}: CustomToolDialogProps) {
    const [name, setName] = useState("");
    const [method, setMethod] = useState("GET");
    const [endpoint, setEndpoint] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (open) {
            if (initialTool) {
                setName(initialTool.name || "");
                setMethod(initialTool.method || "GET");
                setEndpoint(initialTool.endpoint || "");
                setDescription(initialTool.description || "");
            } else {
                setName("");
                setMethod("GET");
                setEndpoint("");
                setDescription("");
            }
        }
    }, [open, initialTool]);

    const handleSave = () => {
        if (!name.trim() || !endpoint.trim()) return;

        onSave({
            name: name.trim(),
            method,
            endpoint: endpoint.trim(),
            description: description.trim(),
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] bg-[#0b0b11] border-[#1a1b26]">
                <DialogHeader className="border-b border-[#1a1b26] pb-4">
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(241,250,140,0.5)" }}>
                        {initialTool ? "Edit" : "Add"}_HTTP_Tool
                    </DialogTitle>
                    <DialogDescription className="text-[#6272a4]">
                        Configure an HTTP tool for this agent.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                            Tool Name *
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="my_api_tool"
                            className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] focus:border-[#f1fa8c] focus:ring-[#f1fa8c]/20"
                        />
                    </div>

                    {/* Method + Endpoint */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <Label className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                                Method
                            </Label>
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0b0b11] border-[#1a1b26]">
                                    <SelectItem value="GET" className="text-[#f8f8f2]">GET</SelectItem>
                                    <SelectItem value="POST" className="text-[#f8f8f2]">POST</SelectItem>
                                    <SelectItem value="PUT" className="text-[#f8f8f2]">PUT</SelectItem>
                                    <SelectItem value="DELETE" className="text-[#f8f8f2]">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                                Endpoint *
                            </Label>
                            <Input
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value)}
                                placeholder="https://api.example.com/endpoint"
                                className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] focus:border-[#f1fa8c] focus:ring-[#f1fa8c]/20"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider">
                            Description
                        </Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What does this tool do..."
                            rows={3}
                            className="bg-[#050101] border-[#1a1b26] text-[#f8f8f2] focus:border-[#f1fa8c] focus:ring-[#f1fa8c]/20 resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="border-t border-[#1a1b26] pt-4 flex-row gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-transparent border-2 border-[#ff5555] text-[#ff5555] hover:bg-[#ff5555]/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || !endpoint.trim()}
                        className="bg-[#f1fa8c] hover:bg-[#f1fa8c]/80 text-[#0b0b11] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(241,250,140,0.4)] disabled:opacity-50"
                    >
                        {initialTool ? "Update" : "Add"} Tool
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
