import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => Promise<void> | void;
    isLoading?: boolean;
    confirmVariant?: "default" | "destructive";
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    isLoading = false,
    confirmVariant = "default",
}: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-[#0b0b11] border-2 border-[#1a1b26] shadow-neu p-0">
                <DialogHeader className="border-b border-[#1a1b26] px-6 py-4">
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-widest text-[#ff5555]">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-[#6272a4] text-xs font-mono uppercase tracking-widest mt-1">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4">
                    {/* Optional: Add an icon or more context here if needed */}
                </div>

                <DialogFooter className="px-6 py-4 bg-[#0b0b11] border-t border-[#1a1b26] flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 bg-transparent text-[#6272a4] font-black uppercase tracking-wider border-2 border-[#6272a4] border-b-4 hover:bg-[#6272a4]/10 active:border-b-2 active:translate-y-1 transition-all h-10 rounded-xl"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 font-black uppercase tracking-wider border-b-4 active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl text-[#050101] ${confirmVariant === 'destructive'
                                ? "bg-[#ff5555] hover:bg-[#ff5555] border-[#ff0000] hover:border-[#ff0000]"
                                : "bg-[#50fa7b] hover:bg-[#50fa7b] border-[#2aa34a] hover:border-[#2aa34a]"
                            }`}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
