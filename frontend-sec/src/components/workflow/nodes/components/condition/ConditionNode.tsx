import { Handle, Position, useEdges, type Node, type NodeProps } from "@xyflow/react";
import { Filter, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { BaseNode } from "../../BaseNode";
import type { ConditionType } from "../../nodeFunctions";
import { ConditionTypeEnum } from "../../nodeFunctions";

export type ConditionNodeType = Node<
    {
        label?: string;
        type?: "and" | "or";
        conditions?: ConditionType[];
    },
    "condition-node"
>;

export type OperatorType =
    | "is_defined"
    | "is_not_defined"
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "starts_with"
    | "ends_with"
    | "greater_than"
    | "greater_than_or_equal"
    | "less_than"
    | "less_than_or_equal"
    | "matches"
    | "not_matches";

const operatorText: Record<OperatorType, string> = {
    equals: "is equal to",
    not_equals: "is not equal to",
    contains: "contains",
    not_contains: "does not contain",
    starts_with: "starts with",
    ends_with: "ends with",
    greater_than: "is greater than",
    greater_than_or_equal: "is greater than or equal to",
    less_than: "is less than",
    less_than_or_equal: "is less than or equal to",
    matches: "matches the pattern",
    not_matches: "does not match the pattern",
    is_defined: "is defined",
    is_not_defined: "is not defined",
};

export function ConditionNode(props: NodeProps) {
    const { selected, data } = props;
    const edges = useEdges();
    const isExecuting = data.isExecuting as boolean | undefined;

    const typeText = {
        and: "all of the following conditions",
        or: "any of the following conditions",
    };

    const isHandleConnected = (handleId: string) => {
        return edges.some(
            (edge) => edge.source === props.id && edge.sourceHandle === handleId,
        );
    };

    const isBottomHandleConnected = isHandleConnected("bottom-handle");

    const conditions: ConditionType[] = data.conditions as ConditionType[];

    const renderCondition = (condition: ConditionType) => {
        const isConnected = isHandleConnected(condition.id);

        if (condition.type === ConditionTypeEnum.PREVIOUS_OUTPUT) {
            return (
                <div
                    className="mb-3 cursor-pointer rounded-lg border border-[#bd93f9]/40 bg-[#bd93f9]/10 p-3 text-left transition-all duration-200 hover:border-[#bd93f9]/60 hover:bg-[#bd93f9]/15"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="font-medium text-[#f8f8f2]">
                                O campo{" "}
                                <span className="font-semibold text-[#bd93f9]">
                                    {condition.data.field}
                                </span>{" "}
                                <span className="text-[#6272a4]">
                                    {operatorText[condition.data.operator as OperatorType]}
                                </span>{" "}
                                {!["is_defined", "is_not_defined"].includes(
                                    condition.data.operator,
                                ) && (
                                        <span className="font-semibold text-[#50fa7b]">
                                            &quot;{condition.data.value}&quot;
                                        </span>
                                    )}
                            </p>
                        </div>
                        <Handle
                            className={cn(
                                "!rounded-full transition-all duration-300",
                                isConnected ? "!bg-[#bd93f9] !border-[#bd93f9]" : "!bg-[#6272a4] !border-[#6272a4]"
                            )}
                            style={{
                                top: "50%",
                                right: "-5px",
                                transform: "translateY(-50%)",
                                height: "14px",
                                position: "relative",
                                width: "14px",
                            }}
                            type="source"
                            position={Position.Right}
                            id={condition.id}
                        />
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <BaseNode hasTarget={true} selected={selected || false} borderColor="purple" isExecuting={isExecuting}>
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bd93f9]/20 shadow-sm">
                        <Filter className="h-5 w-5 text-[#bd93f9]" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-[#bd93f9]">
                            {data.label as string}
                        </p>
                        <p className="text-xs text-[#6272a4]">
                            Matches {typeText[(data.type as "and" | "or") || "and"]}
                        </p>
                    </div>
                </div>
            </div>

            {conditions && conditions.length > 0 && Array.isArray(conditions) ? (
                conditions.map((condition) => (
                    <div key={condition.id}>{renderCondition(condition)}</div>
                ))
            ) : (
                <div className="mb-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#bd93f9]/40 bg-[#bd93f9]/10 p-5 text-center transition-all duration-200 hover:border-[#bd93f9]/60 hover:bg-[#bd93f9]/20">
                    <Filter className="h-8 w-8 text-[#bd93f9]/50 mb-2" />
                    <p className="text-[#bd93f9]">No conditions configured</p>
                    <p className="mt-1 text-xs text-[#6272a4]">Click to add a condition</p>
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
                        isBottomHandleConnected ? "!bg-[#bd93f9] !border-[#bd93f9]" : "!bg-[#6272a4] !border-[#6272a4]",
                        selected && isBottomHandleConnected && "!bg-[#bd93f9] !border-[#bd93f9]"
                    )}
                    style={{
                        right: "0px",
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
