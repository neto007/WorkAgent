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
import { useState, useEffect } from "react";
import { Plus, Settings } from "lucide-react";

interface FolderData {
    name: string;
    description: string;
}

interface FolderFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (folder: FolderData) => Promise<void>;
    editingFolder: { id: string, name: string, description: string } | null;
    isLoading?: boolean;
}

export function FolderFormDialog({
    open,
    onOpenChange,
    onSave,
    editingFolder,
    isLoading = false,
}: FolderFormDialogProps) {
    const [values, setValues] = useState<FolderData>({
        name: "",
        description: "",
    });

    useEffect(() => {
        if (open) {
            if (editingFolder) {
                setValues({
                    name: editingFolder.name,
                    description: editingFolder.description || "",
                });
            } else {
                setValues({
                    name: "",
                    description: "",
                });
            }
        }
    }, [editingFolder, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!values.name.trim()) return;
        await onSave(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-[#0b0b11] border-2 border-[#1a1b26] shadow-neu p-0">
                <DialogHeader className="border-b border-[#1a1b26] px-6 py-4">
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                        {editingFolder ? (
                            <Settings className="h-5 w-5 text-[#bd93f9]" />
                        ) : (
                            <Plus className="h-5 w-5 text-[#50fa7b]" />
                        )}
                        {editingFolder ? "Configure_Folder" : "New_Folder"}
                    </DialogTitle>
                    <DialogDescription className="text-[#6272a4] text-xs font-mono uppercase tracking-widest mt-1">
                        {editingFolder ? "Rename or update folder details." : "Create a new organizational unit."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="folder-name" className="text-xs font-black text-[#6272a4] uppercase tracking-widest">
                            Folder Name
                        </Label>
                        <Input
                            id="folder-name"
                            value={values.name}
                            onChange={(e) =>
                                setValues({ ...values, name: e.target.value })
                            }
                            placeholder="e.g. Finance Agents"
                            className="bg-[#1a1b26] border-2 border-[#1a1b26] text-[#f8f8f2] focus:border-[#50fa7b] focus:shadow-neu-green h-10 rounded-lg transition-all placeholder:text-[#6272a4]/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="folder-description" className="text-xs font-black text-[#6272a4] uppercase tracking-widest">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="folder-description"
                            value={values.description}
                            onChange={(e) =>
                                setValues({ ...values, description: e.target.value })
                            }
                            placeholder="What is this folder for?"
                            className="bg-[#1a1b26] border-2 border-[#1a1b26] text-[#f8f8f2] focus:border-[#8be9fd] focus:shadow-neu-purple min-h-[100px] rounded-lg transition-all placeholder:text-[#6272a4]/50 resize-none"
                        />
                    </div>

                    <DialogFooter className="mt-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="bg-transparent text-[#ff5555] font-black uppercase tracking-wider border-2 border-[#ff5555] border-b-4 hover:bg-[#ff5555]/10 active:border-b-2 active:translate-y-1 transition-all h-10 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!values.name.trim() || isLoading}
                            className={`
                    font-black uppercase tracking-wider border-b-4 active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl text-[#050101]
                    ${editingFolder
                                    ? "bg-[#bd93f9] hover:bg-[#bd93f9] border-[#8a63cf] hover:border-[#8a63cf]"
                                    : "bg-[#50fa7b] hover:bg-[#50fa7b] border-[#2aa34a] hover:border-[#2aa34a]"}
                `}
                        >
                            {isLoading ? "Saving..." : editingFolder ? "Update Folder" : "Create Folder"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
