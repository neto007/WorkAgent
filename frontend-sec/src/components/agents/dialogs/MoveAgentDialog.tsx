/*
 * @author: Davidson Gomes
 * @file: /components/agents/dialogs/MoveAgentDialog.tsx
 * FlowSec Theme
 */
import React, { useState } from 'react';
import { MoveRight, Folder, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types/agent';
import type { Folder as FolderType } from '@/services/agentService';

interface MoveAgentDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (folderId: string | null) => Promise<void>;
    agent?: Agent;
    folders: FolderType[];
    currentFolderId?: string | null;
}

const MoveAgentDialog: React.FC<MoveAgentDialogProps> = ({
    open,
    onClose,
    onSubmit,
    agent,
    folders,
    currentFolderId,
}) => {
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(selectedFolderId);
            onClose();
        } catch (error) {
            console.error('Error moving agent:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <MoveRight className="h-5 w-5 text-yellow-400" />
                        </div>
                        Move Agent
                    </DialogTitle>
                    {agent && (
                        <p className="text-sm text-zinc-400 mt-2">
                            Move <span className="text-white font-medium">{agent.name}</span> to a folder
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-2 max-h-[400px] overflow-y-auto py-2">
                    {/* No Folder Option */}
                    <button
                        onClick={() => setSelectedFolderId(null)}
                        className={cn(
                            "w-full text-left px-4 py-3 rounded-lg border transition-all",
                            "flex items-center gap-3",
                            selectedFolderId === null
                                ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
                                : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600"
                        )}
                    >
                        <Home className="h-5 w-5 flex-shrink-0" />
                        <div>
                            <div className="font-medium">No Folder</div>
                            <div className="text-xs text-zinc-500">Move to root level</div>
                        </div>
                    </button>

                    {/* Folders List */}
                    {folders.map((folder) => (
                        <button
                            key={folder.id}
                            onClick={() => setSelectedFolderId(folder.id)}
                            disabled={folder.id === currentFolderId}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-lg border transition-all",
                                "flex items-center gap-3",
                                selectedFolderId === folder.id
                                    ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
                                    : folder.id === currentFolderId
                                        ? "bg-zinc-800/30 border-zinc-700/50 text-zinc-500 cursor-not-allowed opacity-50"
                                        : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600"
                            )}
                        >
                            <Folder className="h-5 w-5 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="font-medium">{folder.name}</div>
                                {folder.description && (
                                    <div className="text-xs text-zinc-500 truncate">{folder.description}</div>
                                )}
                            </div>
                            {folder.id === currentFolderId && (
                                <span className="text-xs text-zinc-500">(Current)</span>
                            )}
                        </button>
                    ))}

                    {folders.length === 0 && (
                        <div className="text-center py-8 text-zinc-500 text-sm">
                            No folders available. Create a folder first.
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedFolderId === currentFolderId}
                        className={cn(
                            "bg-yellow-600 hover:bg-yellow-700 text-white font-semibold",
                            "shadow-lg hover:shadow-yellow-500/20 transition-all"
                        )}
                    >
                        {isSubmitting ? 'Moving...' : 'Move Agent'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MoveAgentDialog;
