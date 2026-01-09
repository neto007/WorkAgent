import { Handle, Position, type NodeProps, useEdges } from "@xyflow/react";
import { Clock, ArrowRight, Timer } from "lucide-react";
import type { DelayType } from "../../nodeFunctions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { BaseNode } from "../../BaseNode";

export function DelayNode(props: NodeProps) {
    const { selected, data } = props;

    const edges = useEdges();
    const isExecuting = data.isExecuting as boolean | undefined;

    const isHandleConnected = (handleId: string) => {
        return edges.some(
            (edge) => edge.source === props.id && edge.sourceHandle === handleId
        );
    };

    const isBottomHandleConnected = isHandleConnected("bottom-handle");

    const delay = data.delay as DelayType | undefined;

    const getUnitLabel = (unit: string) => {
        switch (unit) {
            case 'seconds':
                return 'Seconds';
            case 'minutes':
                return 'Minutes';
            case 'hours':
                return 'Hours';
            case 'days':
                return 'Days';
            default:
                return unit;
        }
    };

    return (
        <BaseNode hasTarget={true} selected={selected || false} borderColor="yellow" isExecuting={isExecuting}>
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1fa8c]/20 shadow-sm">
                        <Clock className="h-5 w-5 text-[#f1fa8c]" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-[#f1fa8c]">
                            {data.label as string}
                        </p>
                    </div>
                </div>
            </div>

            {delay ? (
                <div className="mb-3 rounded-lg border border-[#f1fa8c]/40 bg-[#f1fa8c]/10 p-3 transition-all duration-200 hover:border-[#f1fa8c]/60 hover:bg-[#f1fa8c]/15">
                    <div className="flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center">
                                <Timer className="h-4 w-4 text-[#f1fa8c]" />
                                <span className="ml-1.5 font-medium text-[#f8f8f2]">Delay</span>
                            </div>
                            <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-xs bg-[#f1fa8c]/20 text-[#f1fa8c] border-[#f1fa8c]/40"
                            >
                                {getUnitLabel(delay.unit)}
                            </Badge>
                        </div>

                        <div className="mt-2 flex items-center">
                            <span className="text-lg font-semibold text-[#f1fa8c]">{delay.value}</span>
                            <span className="ml-1 text-sm text-[#6272a4]">{delay.unit}</span>
                        </div>

                        {delay.description && (
                            <p className="mt-2 text-xs text-[#6272a4] line-clamp-2">
                                {delay.description.slice(0, 80)} {delay.description.length > 80 && '...'}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="mb-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#f1fa8c]/40 bg-[#f1fa8c]/10 p-5 text-center transition-all duration-200 hover:border-[#f1fa8c]/60 hover:bg-[#f1fa8c]/20">
                    <Clock className="h-8 w-8 text-[#f1fa8c]/50 mb-2" />
                    <p className="text-[#f1fa8c]">No delay configured</p>
                    <p className="mt-1 text-xs text-[#6272a4]">Click to configure</p>
                </div>
            )}

            <div className="mt-2 flex items-center justify-end text-sm text-[#6272a4] transition-colors">
                <div className="flex items-center space-x-1 rounded-md py-1 px-2">
                    <span>Next step</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <Handle
                    className={cn(
                        "!w-3 !h-3 !rounded-full transition-all duration-300",
                        isBottomHandleConnected ? "!bg-[#f1fa8c] !border-[#f1fa8c]" : "!bg-[#6272a4] !border-[#6272a4]",
                        selected && isBottomHandleConnected && "!bg-[#f1fa8c] !border-[#f1fa8c]"
                    )}
                    style={{
                        right: "-8px",
                        top: "calc(100% - 25px)",
                    }}
                    type="source"
                    position={Position.Right}
                    id="bottom-handle"
                />
            </div>
        </BaseNode>
    );
}
