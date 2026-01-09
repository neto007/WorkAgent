/*
 * @author: Davidson Gomes
 * @file: /components/agents/dialogs/FolderDialog.tsx
 * FlowSec Theme
 */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Folder } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Folder as FolderType } from '@/services/agentService';

const folderSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
    description: z.string().max(200, 'Description too long').optional(),
});

type FolderFormData = z.infer<typeof folderSchema>;

interface FolderDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: FolderFormData) => Promise<void>;
    folder?: FolderType;
    mode: 'create' | 'edit';
}

const FolderDialog: React.FC<FolderDialogProps> = ({
    open,
    onClose,
    onSubmit,
    folder,
    mode,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FolderFormData>({
        resolver: zodResolver(folderSchema),
        defaultValues: folder
            ? {
                name: folder.name,
                description: folder.description || '',
            }
            : {
                name: '',
                description: '',
            },
    });

    useEffect(() => {
        if (folder) {
            reset({
                name: folder.name,
                description: folder.description || '',
            });
        } else {
            reset({ name: '', description: '' });
        }
    }, [folder, reset, open]);

    const onFormSubmit = async (data: FolderFormData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            reset();
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <Folder className="h-5 w-5 text-purple-400" />
                        </div>
                        {mode === 'create' ? 'Create Folder' : 'Edit Folder'}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-6 w-6 text-zinc-400 hover:text-white ml-auto"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-300 font-medium">Folder Name *</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="My Folder"
                            disabled={isSubmitting}
                            autoFocus
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-400">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-300 font-medium">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Organize your agents..."
                            disabled={isSubmitting}
                            rows={3}
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-400">{errors.description.message}</p>
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
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "bg-purple-600 hover:bg-purple-700 text-white font-semibold",
                                "shadow-lg hover:shadow-purple-500/20 transition-all"
                            )}
                        >
                            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Folder' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FolderDialog;
