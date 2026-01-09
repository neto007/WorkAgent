/*
 * @author: Davidson Gomes
 * @file: /components/agents/AgentSidebar.tsx
 * FlowSec Theme - Estilo consistente com LoginPage
 */
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Folder,
    FolderPlus,
    Home,
    MoreVertical,
    Edit,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentFolder {
    id: string;
    name: string;
    description: string;
}

interface AgentSidebarProps {
    visible: boolean;
    folders: AgentFolder[];
    selectedFolderId: string | null;
    onSelectFolder: (id: string | null) => void;
    onAddFolder: () => void;
    onEditFolder: (folder: AgentFolder) => void;
    onDeleteFolder: (folder: AgentFolder) => void;
    onToggle: () => void;
}

export function AgentSidebar({
    visible,
    folders,
    selectedFolderId,
    onSelectFolder,
    onAddFolder,
    onEditFolder,
    onDeleteFolder,
    onToggle,
}: AgentSidebarProps) {
    return (
        <>
            {/* Sidebar */}
            <div
                onDoubleClick={onToggle}
                className={cn(
                    "fixed top-16 z-40 h-[calc(100vh-4rem)]",
                    "bg-[#0b0b11] border-r border-[#1a1b26]",
                    "shadow-2xl transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden",
                    visible ? "w-64" : "w-16"
                )}
            >
                {/* Header */}
                <div className={cn("flex items-center mb-6 pb-4 border-b border-[#1a1b26] transition-all", visible ? "justify-between px-4 pt-4" : "justify-center p-2 pt-4")}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-[#bd93f9]/10 border border-[#bd93f9]/30 flex-shrink-0">
                            <Folder className="h-4 w-4 text-[#bd93f9]" />
                        </div>
                        {visible && (
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#f8f8f2] animate-in fade-in zoom-in duration-300">
                                Folders
                            </h2>
                        )}
                    </div>
                    {visible && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onAddFolder}
                            className="h-8 w-8 rounded text-[#50fa7b] hover:text-[#50fa7b]/80 hover:bg-[#50fa7b]/10 border border-transparent hover:border-[#50fa7b]/30 transition-all animate-in fade-in zoom-in duration-300"
                        >
                            <FolderPlus className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Folder List */}
                <div className="space-y-1 px-2">
                    {/* All Agents */}
                    <button
                        className={cn(
                            "w-full text-left py-2.5 rounded flex items-center transition-all duration-200 border",
                            visible ? "px-3 gap-3" : "justify-center px-0",
                            "text-[10px] font-black uppercase tracking-widest",
                            selectedFolderId === null
                                ? "bg-[#bd93f9] text-black border-[#bd93f9] shadow-[0_0_10px_rgba(189,147,249,0.3)]"
                                : "text-[#6272a4] hover:text-[#bd93f9] hover:bg-[#1a1b26] border-transparent"
                        )}
                        onClick={() => onSelectFolder(null)}
                        title={!visible ? "All Agents" : undefined}
                    >
                        <Home className="h-4 w-4 flex-shrink-0" />
                        {visible && <span className="animate-in fade-in slide-in-from-left-2 duration-300">All_Agents</span>}
                    </button>

                    {/* Folder Items */}
                    {folders.map((folder) => (
                        <div key={folder.id} className={cn("flex items-center group/item relative", visible ? "gap-1" : "justify-center")}>
                            <button
                                className={cn(
                                    "flex-1 text-left py-2.5 rounded flex items-center transition-all duration-200 border",
                                    visible ? "px-3 gap-3" : "justify-center px-0 w-full",
                                    "text-[10px] font-bold",
                                    selectedFolderId === folder.id
                                        ? "bg-[#bd93f9]/20 text-[#bd93f9] border-[#bd93f9]/30"
                                        : "text-[#6272a4] hover:text-[#f8f8f2] hover:bg-[#1a1b26] border-transparent"
                                )}
                                onClick={() => onSelectFolder(folder.id)}
                                title={!visible ? folder.name : undefined}
                            >
                                <Folder className="h-4 w-4 flex-shrink-0" />
                                {visible && <span className="truncate font-mono animate-in fade-in slide-in-from-left-2 duration-300">{folder.name}</span>}
                            </button>

                            <div className={cn(
                                "transition-opacity",
                                visible ? "opacity-0 group-hover/item:opacity-100" : "hidden" // Hide actions when collapsed
                            )}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded text-[#6272a4] hover:text-[#f8f8f2] hover:bg-[#1a1b26]"
                                        >
                                            <MoreVertical className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="bg-[#0b0b11] border-[#1a1b26] min-w-[160px]"
                                    >
                                        <DropdownMenuItem
                                            className="text-[#f8f8f2] hover:bg-[#1a1b26] cursor-pointer text-[10px] font-bold"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditFolder(folder);
                                            }}
                                        >
                                            <Edit className="h-3 w-3 mr-2 text-[#8be9fd]" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-[#ff5555] hover:bg-[#ff5555]/10 cursor-pointer text-[10px] font-bold"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFolder(folder);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}

                    {folders.length === 0 && visible && (
                        <div className="text-center py-8 px-4 animate-in fade-in duration-300">
                            <p className="text-[#6272a4] text-[10px] font-mono mb-2">
                                No_folders_yet
                            </p>
                            <button
                                onClick={onAddFolder}
                                className="text-[9px] font-black uppercase tracking-widest text-[#50fa7b] hover:text-[#50fa7b]/80 transition-colors"
                            >
                                Create_First_Folder
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
