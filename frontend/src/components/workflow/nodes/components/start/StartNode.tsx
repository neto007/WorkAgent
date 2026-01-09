import { Handle, type Node, type NodeProps, Position, useEdges } from "@xyflow/react";
import { Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";


import { BaseNode } from "../../BaseNode";

export type StartNodeType = Node<
    {
        label?: string;
    },
    "start-node"
>;

export function StartNode(props: NodeProps) {
    const { selected, data } = props;
    const edges = useEdges();
    const isExecuting = data.isExecuting as boolean | undefined;

    const isSourceHandleConnected = edges.some(
        (edge) => edge.source === props.id
    );



    return (
        <BaseNode hasTarget={false} selected={selected || false} borderColor="blue" isExecuting={isExecuting}>
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3d5afe]/20 shadow-sm">
                        <Zap className="h-5 w-5 text-[#3d5afe]" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-[#3d5afe]">Start</p>
                    </div>
                </div>
            </div>

            <div className="mb-3 rounded-lg border border-[#3d5afe]/40 bg-[#3d5afe]/10 p-3 transition-all duration-200 hover:border-[#3d5afe]/60 hover:bg-[#3d5afe]/15">
                <div className="flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center">
                            <span className="font-medium text-[#f8f8f2]">Input: User content</span>
                        </div>
                    </div>

                    <p className="mt-2 text-xs text-[#6272a4]">
                        The workflow begins when a user sends a message to the agent
                    </p>
                </div>
            </div>


            <div className="mt-2 flex items-center justify-end text-sm text-[#6272a4] transition-colors">
                <div className="flex items-center space-x-1 rounded-md py-1 px-2">
                    <span>Next step</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <Handle
                    className={cn(
                        "!w-3 !h-3 !rounded-full transition-all duration-300",
                        isSourceHandleConnected ? "!bg-[#3d5afe] !border-[#3d5afe]" : "!bg-[#6272a4] !border-[#6272a4]",
                        selected && isSourceHandleConnected && "!bg-[#3d5afe] !border-[#3d5afe]"
                    )}
                    style={{
                        position: "absolute",
                        right: "-8px",
                        top: "calc(100% - 25px)",
                        boxShadow: isSourceHandleConnected ? "0 0 10px #3d5afe" : undefined,
                        color: '#3d5afe' // For currentColor in CSS hover
                    }}
                    type="source"
                    position={Position.Right}
                />
            </div>
        </BaseNode>
    );
}
