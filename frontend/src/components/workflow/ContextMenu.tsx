import { useReactFlow, type Node, type Edge } from "@xyflow/react";
import { Copy, Trash2 } from "lucide-react";
import React, { useCallback } from "react";

interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    id: string;
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
}

export default function ContextMenu({
    id,
    top,
    left,
    right,
    bottom,
    ...props
}: ContextMenuProps) {
    const { getNode, setNodes, addNodes, setEdges } = useReactFlow();

    const duplicateNode = useCallback(() => {
        const node = getNode(id);

        if (!node) {
            console.error(`Node with id ${id} not found.`);
            return;
        }

        const position = {
            x: node.position.x + 50,
            y: node.position.y + 50,
        };

        addNodes({
            ...node,
            id: `${node.id}-copy`,
            position,
            selected: false,
            dragging: false,
        });
    }, [id, getNode, addNodes]);

    const deleteNode = useCallback(() => {
        setNodes((nodes: Node[]) => nodes.filter((node) => node.id !== id));
        setEdges((edges: Edge[]) =>
            edges.filter((edge) => edge.source !== id && edge.target !== id),
        );
    }, [id, setNodes, setEdges]);

    return (
        <div
            style={{
                position: "absolute",
                top: top !== undefined ? `${top}px` : undefined,
                left: left !== undefined ? `${left}px` : undefined,
                right: right !== undefined ? `${right}px` : undefined,
                bottom: bottom !== undefined ? `${bottom}px` : undefined,
                zIndex: 10,
            }}
            className="context-menu rounded-lg border-2 border-[#1a1b26] p-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-[#0b0b11]"
            {...props}
        >
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                Actions
            </p>
            <button
                onClick={duplicateNode}
                className="mb-1 flex w-full flex-row items-center rounded-md px-3 py-2 text-sm hover:bg-[#1a1b26] transition-colors"
            >
                <Copy
                    size={14}
                    className="mr-2 flex-shrink-0 text-[#8be9fd]"
                />
                <span className="text-[#f8f8f2] text-xs font-bold">Duplicate</span>
            </button>
            <button
                onClick={deleteNode}
                className="flex w-full flex-row items-center rounded-md px-3 py-2 text-sm hover:bg-[#1a1b26] transition-colors"
            >
                <Trash2
                    size={14}
                    className="mr-2 flex-shrink-0 text-[#ff5555]"
                />
                <span className="text-[#f8f8f2] text-xs font-bold">Delete</span>
            </button>
        </div>
    );
}
