import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Save, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MessageForm({
    selectedNode,
    handleUpdateNode,
}: {
    selectedNode: any;
    handleUpdateNode: any;
}) {
    const [node, setNode] = useState(selectedNode);
    const [messageType, setMessageType] = useState("text");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (selectedNode) {
            setNode(selectedNode);
            setMessageType(selectedNode.data.message?.type || "text");
            setContent(selectedNode.data.message?.content || "");
        }
    }, [selectedNode]);

    const handleSave = () => {
        const updatedNode = {
            ...node,
            data: {
                ...node.data,
                message: {
                    type: messageType,
                    content,
                },
            },
        };
        setNode(updatedNode);
        handleUpdateNode(updatedNode);
    };

    return (
        <div className="flex flex-col h-full bg-[#0b0b11]">
            {/* Header */}
            <div className="p-4 border-b-2 border-[#1a1b26] flex-shrink-0">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-3">
                    Message Configuration
                </h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#f8f8f2] font-bold">Type:</span>
                        <Badge className="text-[10px] bg-[#ffb86c]/20 text-[#ffb86c] border-[#ffb86c]/40">
                            {messageType.toUpperCase()}
                        </Badge>
                    </div>
                    <Select value={messageType} onValueChange={setMessageType}>
                        <SelectTrigger className="w-[120px] h-8 bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]">
                            <SelectItem value="text">Text</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-[#ffb86c]/10 border-2 border-[#ffb86c]/30">
                        <div className="flex items-start gap-2">
                            <div className="bg-[#ffb86c]/20 rounded-full p-1.5">
                                <MessageSquare size={16} className="text-[#ffb86c]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#f8f8f2] text-sm">Text Message</h4>
                                <p className="text-xs text-[#6272a4] mt-1">Simple text message</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                            Message Content
                        </Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type your message here..."
                            className="min-h-[150px] bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2] resize-none focus-visible:ring-[#ffb86c] focus-visible:border-[#ffb86c]"
                        />
                    </div>

                    {content.trim() !== "" ? (
                        <div className="rounded-lg bg-[#1a1b26] border-2 border-[#282a36] p-3">
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                Preview
                            </div>
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#0b0b11]">
                                <div className="rounded-full bg-[#ffb86c]/20 p-1.5">
                                    <MessageSquare size={14} className="text-[#ffb86c]" />
                                </div>
                                <div className="text-sm text-[#f8f8f2] whitespace-pre-wrap">{content}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg bg-[#1a1b26]/50 border-2 border-dashed border-[#282a36] p-6 flex flex-col items-center justify-center text-center">
                            <AlertCircle className="h-8 w-8 text-[#6272a4] mb-2" />
                            <p className="text-[#6272a4] text-sm">Your message will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-[#1a1b26] flex-shrink-0">
                <Button
                    className="w-full bg-[#ffb86c] hover:bg-[#ffb86c]/80 text-[#0b0b11] font-bold"
                    onClick={handleSave}
                >
                    <Save size={14} className="mr-2" />
                    Save Message
                </Button>
            </div>
        </div>
    );
}
