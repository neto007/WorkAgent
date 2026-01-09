import { Handle, type NodeProps, Position, useEdges } from "@xyflow/react";
import { MessageSquare, FileText, Image, File, Video, ArrowRight } from "lucide-react";
import type { MessageType } from "../../nodeFunctions";
import { MessageTypeEnum } from "../../nodeFunctions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { BaseNode } from "../../BaseNode";

export function MessageNode(props: NodeProps) {
    const { selected, data } = props;
    const edges = useEdges();
    const isExecuting = data.isExecuting as boolean | undefined;

    const isHandleConnected = (handleId: string) => {
        return edges.some(
            (edge) => edge.source === props.id && edge.sourceHandle === handleId
        );
    };

    const isBottomHandleConnected = isHandleConnected("bottom-handle");

    const message = data.message as MessageType | undefined;

    const getMessageTypeIcon = (type: string) => {
        switch (type) {
            case MessageTypeEnum.TEXT:
                return <FileText className="h-4 w-4 text-[#ffb86c]" />;
            case "image":
                return <Image className="h-4 w-4 text-[#8be9fd]" />;
            case "file":
                return <File className="h-4 w-4 text-[#50fa7b]" />;
            case "video":
                return <Video className="h-4 w-4 text-[#bd93f9]" />;
            default:
                return <MessageSquare className="h-4 w-4 text-[#ffb86c]" />;
        }
    };

    const getMessageTypeColor = (type: string) => {
        switch (type) {
            case MessageTypeEnum.TEXT:
                return 'bg-[#ffb86c]/20 text-[#ffb86c] border-[#ffb86c]/40';
            case "image":
                return 'bg-[#8be9fd]/20 text-[#8be9fd] border-[#8be9fd]/40';
            case "file":
                return 'bg-[#50fa7b]/20 text-[#50fa7b] border-[#50fa7b]/40';
            case "video":
                return 'bg-[#bd93f9]/20 text-[#bd93f9] border-[#bd93f9]/40';
            default:
                return 'bg-[#ffb86c]/20 text-[#ffb86c] border-[#ffb86c]/40';
        }
    };

    const getMessageTypeName = (type: string) => {
        const messageTypes: Record<string, string> = {
            text: "Text Message",
            image: "Image",
            file: "File",
            video: "Video",
        };
        return messageTypes[type] || type;
    };

    return (
        <BaseNode hasTarget={true} selected={selected || false} borderColor="orange" isExecuting={isExecuting}>
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffb86c]/20 shadow-sm">
                        <MessageSquare className="h-5 w-5 text-[#ffb86c]" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-[#ffb86c]">
                            {data.label as string}
                        </p>
                    </div>
                </div>
            </div>

            {message ? (
                <div className="mb-3 rounded-lg border border-[#ffb86c]/40 bg-[#ffb86c]/10 p-3 transition-all duration-200 hover:border-[#ffb86c]/60 hover:bg-[#ffb86c]/15">
                    <div className="flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center">
                                {getMessageTypeIcon(message.type)}
                                <span className="ml-1.5 font-medium text-[#f8f8f2]">{getMessageTypeName(message.type)}</span>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn("px-1.5 py-0 text-xs", getMessageTypeColor(message.type))}
                            >
                                {message.type}
                            </Badge>
                        </div>

                        {message.content && (
                            <p className="mt-2 text-xs text-[#6272a4] line-clamp-2">
                                {message.content.slice(0, 80)} {message.content.length > 80 && '...'}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="mb-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#ffb86c]/40 bg-[#ffb86c]/10 p-5 text-center transition-all duration-200 hover:border-[#ffb86c]/60 hover:bg-[#ffb86c]/20">
                    <MessageSquare className="h-8 w-8 text-[#ffb86c]/50 mb-2" />
                    <p className="text-[#ffb86c]">No message configured</p>
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
                        isBottomHandleConnected ? "!bg-[#ffb86c] !border-[#ffb86c]" : "!bg-[#6272a4] !border-[#6272a4]",
                        selected && isBottomHandleConnected && "!bg-[#ffb86c] !border-[#ffb86c]"
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
