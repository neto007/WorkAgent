
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { Agent } from "@/types/agent";

interface ShareAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agent: Agent;
    apiKey: string;
}

export function ShareAgentDialog({
    open,
    onOpenChange,
    agent,
    apiKey,
}: ShareAgentDialogProps) {
    const { toast } = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(apiKey);
            // Copied state logic removed for now or use separate toast
            toast.success("Copied!", {
                description: "API Key copied to clipboard",
            });
        } catch (err) {
            toast.error("Error", {
                description: "Failed to copy to clipboard",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-[#0b0b11] border-[#1a1b26] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <DialogHeader className="border-b border-[#1a1b26] pb-4">
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-widest" style={{ textShadow: "0 0 10px rgba(189,147,249,0.5)" }}>
                        Share_Agent
                    </DialogTitle>
                    <DialogDescription className="text-[#6272a4]">
                        Use this API key to interact with <strong>{agent.name}</strong> externally.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                readOnly
                                value={apiKey}
                                className="pr-12 bg-[#050101] border-[#1a1b26] text-[#bd93f9] font-mono text-sm shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] focus-visible:ring-[#bd93f9]/30"
                            />
                            <Button
                                size="icon"
                                onClick={handleCopy}
                                className="absolute right-1 top-1 h-8 w-8 bg-[#1a1b26] hover:bg-[#282a36] text-[#f8f8f2] border border-[#44475a]"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-[#6272a4] uppercase tracking-wider">
                            Warning: Do not share this key publicly.
                        </p>
                    </div>
                </div>

                <DialogFooter className="border-t border-[#1a1b26] pt-4">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="bg-[#50fa7b] hover:bg-[#50fa7b]/80 text-[#282a36] font-bold uppercase tracking-wider w-full shadow-[0_0_15px_rgba(80,250,123,0.4)] hover:shadow-[0_0_25px_rgba(80,250,123,0.6)] transition-all"
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
