/*
 * @author: Davidson Gomes
 * @file: /components/agents/EmptyState.tsx
 * FlowSec Theme
 */
import React from 'react';
import { Bot, Search, FolderOpen, Plus, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    type?: 'no-agents' | 'search-no-results' | 'empty-folder' | 'generic';
    title?: string;
    description?: string;
    action?: React.ReactNode;
    searchTerm?: string;
    onAction?: () => void;
    actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    type = 'generic',
    title,
    description,
    action,
    searchTerm,
    onAction,
    actionLabel
}) => {
    let icon: React.ReactNode = <Bot className="w-16 h-16 text-[#6272a4] mb-4 animate-pulse" />;
    let displayTitle = title || 'No_Agents_Found';
    let displayDescription = description || 'Create your first AI agent to get started';
    let displayAction = action;

    if (type === 'search-no-results') {
        icon = (
            <div className="relative">
                <Search className="w-16 h-16 text-[#6272a4] mb-4" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff5555]/20 border border-[#ff5555] rounded-full flex items-center justify-center">
                    <span className="text-[#ff5555] text-xs font-bold">!</span>
                </div>
            </div>
        );
        displayTitle = 'No Results Found';
        displayDescription = searchTerm
            ? `No agents found matching "${searchTerm}"`
            : 'Try adjusting your search criteria';
        if (onAction) {
            displayAction = (
                <Button
                    variant="outline"
                    onClick={onAction}
                    className="border-[#44475a] bg-[#1a1b26] text-[#f8f8f2] hover:bg-[#44475a]/30 hover:border-[#6272a4] font-jetbrains text-xs uppercase tracking-wider"
                >
                    Clear Search
                </Button>
            );
        }
    } else if (type === 'empty-folder') {
        icon = (
            <div className="relative">
                <FolderOpen className="w-16 h-16 text-[#6272a4] mb-4" />
                <Sparkles className="absolute top-0 right-0 w-6 h-6 text-[#f1fa8c] animate-pulse" />
            </div>
        );
        displayTitle = 'Empty Folder';
        displayDescription = 'This folder has no agents yet';
        if (onAction) {
            displayAction = (
                <Button
                    onClick={onAction}
                    className="bg-[#50fa7b] hover:bg-[#50fa7b]/80 text-[#282a36] font-bold shadow-[0_0_20px_rgba(80,250,123,0.3)] hover:shadow-[0_0_30px_rgba(80,250,123,0.5)] font-jetbrains text-xs uppercase tracking-widest transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {actionLabel || 'Create Agent'}
                </Button>
            );
        }
    } else if (type === 'no-agents') {
        icon = (
            <div className="relative">
                <Bot className="w-20 h-20 text-[#6272a4] mb-6 animate-pulse" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#50fa7b] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-[#bd93f9] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#ff79c6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        );
        if (onAction) {
            displayAction = (
                <Button
                    onClick={onAction}
                    className="bg-gradient-to-r from-[#50fa7b] to-[#8be9fd] hover:from-[#50fa7b]/80 hover:to-[#8be9fd]/80 text-[#282a36] font-bold shadow-[0_0_20px_rgba(80,250,123,0.3)] hover:shadow-[0_0_30px_rgba(139,233,253,0.5)] font-jetbrains text-xs uppercase tracking-widest transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    {actionLabel || 'Create Agent'}
                </Button>
            );
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-gradient-to-br from-[#1a1b26] to-[#0b0b11] border border-[#44475a]/30 rounded-xl backdrop-blur-sm">
            <div className="mb-6">
                {icon}
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#f8f8f2] mb-3 font-jetbrains text-center">
                {displayTitle}
            </h3>
            <p className="text-xs text-[#6272a4] font-medium mb-8 font-jetbrains max-w-md text-center leading-relaxed">
                {displayDescription}
            </p>
            {displayAction}
        </div>
    );
};

export default EmptyState;
