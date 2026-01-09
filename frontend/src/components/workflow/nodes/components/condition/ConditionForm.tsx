import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ConditionType } from "../../nodeFunctions";
import { ConditionTypeEnum } from "../../nodeFunctions";
import { ConditionDialog } from "./ConditionDialog";

export function ConditionForm({
    selectedNode,
    handleUpdateNode,
}: {
    selectedNode: any;
    handleUpdateNode: any;
}) {
    const [node, setNode] = useState(selectedNode);
    const [conditions, setConditions] = useState<ConditionType[]>(
        selectedNode.data.conditions || []
    );
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (selectedNode) {
            setNode(selectedNode);
            setConditions(selectedNode.data.conditions || []);
        }
    }, [selectedNode]);

    const handleDelete = (conditionId: string) => {
        const newConditions = conditions.filter((c) => c.id !== conditionId);
        setConditions(newConditions);
        handleUpdateNode({
            ...node,
            data: { ...node.data, conditions: newConditions },
        });
    };

    const renderCondition = (condition: ConditionType) => {
        if (condition.type === ConditionTypeEnum.PREVIOUS_OUTPUT) {
            return (
                <div
                    key={condition.id}
                    className="p-3 rounded-lg bg-[#1a1b26] border-2 border-[#282a36] hover:border-[#bd93f9]/50 transition-all group"
                >
                    <div className="flex items-start gap-2">
                        <div className="bg-[#bd93f9]/20 rounded-full p-1.5 flex-shrink-0">
                            <Filter size={16} className="text-[#bd93f9]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-[#f8f8f2] text-sm">Condition</h4>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(condition.id)}
                                    className="h-6 w-6 text-[#6272a4] opacity-0 group-hover:opacity-100 hover:text-[#ff5555] hover:bg-[#ff5555]/10"
                                >
                                    <Trash2 size={12} />
                                </Button>
                            </div>
                            <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge className="text-[10px] bg-[#bd93f9]/20 text-[#bd93f9] border-[#bd93f9]/40">
                                        Field
                                    </Badge>
                                    <span className="text-xs text-[#f8f8f2] font-medium">{condition.data.field}</span>
                                </div>
                                <p className="text-xs text-[#6272a4]">
                                    {condition.data.operator} {condition.data.value && `"${condition.data.value}"`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-[#0b0b11]">
            {/* Header */}
            <div className="p-4 border-b-2 border-[#1a1b26] flex-shrink-0">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-3">
                    Condition Configuration
                </h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#f8f8f2] font-bold">Logic Type:</span>
                        <Badge className="text-[10px] bg-[#bd93f9]/20 text-[#bd93f9] border-[#bd93f9]/40">
                            {node.data.type === "or" ? "ANY" : "ALL"}
                        </Badge>
                    </div>
                    <Select
                        value={node.data.type || "and"}
                        onValueChange={(value) => {
                            const updatedNode = {
                                ...node,
                                data: {
                                    ...node.data,
                                    type: value,
                                },
                            };
                            setNode(updatedNode);
                            handleUpdateNode(updatedNode);
                        }}
                    >
                        <SelectTrigger className="w-[120px] h-8 bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]">
                            <SelectItem value="and">ALL (AND)</SelectItem>
                            <SelectItem value="or">ANY (OR)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <p className="text-xs text-[#6272a4] mt-2">
                    {node.data.type === "or"
                        ? "Any condition must be true"
                        : "All conditions must be true"}
                </p>
            </div>

            {/* Conditions List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                        Conditions
                    </h3>
                    <Button
                        size="sm"
                        className="h-7 bg-[#bd93f9] hover:bg-[#bd93f9]/80 text-[#0b0b11] font-bold text-xs"
                        onClick={() => setOpen(true)}
                    >
                        <Plus size={12} className="mr-1" />
                        Add
                    </Button>
                </div>

                {conditions.length > 0 ? (
                    <div className="space-y-2">
                        {conditions.map((condition) => renderCondition(condition))}
                    </div>
                ) : (
                    <div
                        onClick={() => setOpen(true)}
                        className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-[#282a36] hover:border-[#bd93f9]/50 transition-all cursor-pointer"
                    >
                        <Filter className="h-12 w-12 text-[#6272a4] mb-2" />
                        <p className="text-[#6272a4] font-bold">No conditions yet</p>
                        <p className="text-xs text-[#6272a4] mt-1">Click to add</p>
                    </div>
                )}
            </div>

            <ConditionDialog
                open={open}
                onOpenChange={setOpen}
                selectedNode={selectedNode}
                handleUpdateNode={handleUpdateNode}
            />
        </div>
    );
}
