import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import type { ConditionType } from "../../nodeFunctions";
import { ConditionTypeEnum } from "../../nodeFunctions";
import { Button } from "@/components/ui/button";
import { Filter, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const operators = [
    { value: "is_defined", label: "is defined" },
    { value: "is_not_defined", label: "is not defined" },
    { value: "equals", label: "is equal to" },
    { value: "not_equals", label: "is not equal to" },
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
    { value: "greater_than", label: "is greater than" },
    { value: "greater_than_or_equal", label: "is greater than or equal to" },
    { value: "less_than", label: "is less than" },
    { value: "less_than_or_equal", label: "is less than or equal to" },
    { value: "matches", label: "matches the regex" },
    { value: "not_matches", label: "does not match the regex" },
];

const outputFields = [
    { value: "content", label: "Content" },
    { value: "status", label: "Status" },
];

export function ConditionDialog({
    open,
    onOpenChange,
    selectedNode,
    handleUpdateNode,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedNode: any;
    handleUpdateNode: any;
}) {
    const [selectedField, setSelectedField] = useState(outputFields[0].value);
    const [selectedOperator, setSelectedOperator] = useState(operators[0].value);
    const [comparisonValue, setComparisonValue] = useState("");

    const handleConditionSave = (condition: ConditionType) => {
        const newConditions = selectedNode.data.conditions
            ? [...selectedNode.data.conditions]
            : [];
        newConditions.push(condition);

        const updatedNode = {
            ...selectedNode,
            data: {
                ...selectedNode.data,
                conditions: newConditions,
            },
        };

        handleUpdateNode(updatedNode);
        onOpenChange(false);

        // Reset form
        setSelectedField(outputFields[0].value);
        setSelectedOperator(operators[0].value);
        setComparisonValue("");
    };

    const getOperatorLabel = (value: string) => {
        return operators.find((op) => op.value === value)?.label || value;
    };

    const getFieldLabel = (value: string) => {
        return outputFields.find((field) => field.value === value)?.label || value;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0b0b11] border-2 border-[#1a1b26] text-[#f8f8f2] sm:max-w-[650px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-[#f8f8f2]">Add New Condition</DialogTitle>
                    <DialogDescription className="text-[#6272a4]">
                        Configure a condition to control workflow execution
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Condition Type */}
                    <div className="grid gap-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                            Condition Type
                        </Label>
                        <div
                            className="flex items-center space-x-3 rounded-lg border-2 border-[#bd93f9] bg-[#bd93f9]/10 p-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#bd93f9]/20">
                                <Filter className="h-5 w-5 text-[#bd93f9]" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-[#f8f8f2]">Previous output</h4>
                                <p className="text-xs text-[#6272a4]">
                                    Validate the result returned by the previous node
                                </p>
                            </div>
                            <Badge className="bg-[#bd93f9] text-[#0b0b11] font-bold">Selected</Badge>
                        </div>
                    </div>

                    {/* Configuration */}
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                                Configuration
                            </Label>
                            <div className="flex items-center gap-2 text-xs text-[#6272a4]">
                                <span>Field</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>Operator</span>
                                {!["is_defined", "is_not_defined"].includes(selectedOperator) && (
                                    <>
                                        <ArrowRight className="h-3 w-3" />
                                        <span>Value</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Field */}
                            <div className="grid gap-2">
                                <Label htmlFor="field" className="text-xs text-[#f8f8f2] font-bold">
                                    Output Field
                                </Label>
                                <Select value={selectedField} onValueChange={setSelectedField}>
                                    <SelectTrigger
                                        id="field"
                                        className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]">
                                        {outputFields.map((field) => (
                                            <SelectItem key={field.value} value={field.value}>
                                                {field.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Operator */}
                            <div className="grid gap-2">
                                <Label htmlFor="operator" className="text-xs text-[#f8f8f2] font-bold">
                                    Operator
                                </Label>
                                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                                    <SelectTrigger
                                        id="operator"
                                        className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]">
                                        {operators.map((op) => (
                                            <SelectItem key={op.value} value={op.value}>
                                                {op.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Value */}
                            {!["is_defined", "is_not_defined"].includes(selectedOperator) && (
                                <div className="grid gap-2">
                                    <Label htmlFor="value" className="text-xs text-[#f8f8f2] font-bold">
                                        Comparison Value
                                    </Label>
                                    <Input
                                        id="value"
                                        value={comparisonValue}
                                        onChange={(e) => setComparisonValue(e.target.value)}
                                        className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2] focus-visible:ring-[#bd93f9] focus-visible:border-[#bd93f9]"
                                        placeholder="Enter value..."
                                    />
                                </div>
                            )}

                            {/* Preview */}
                            <div className="rounded-lg bg-[#1a1b26] border-2 border-[#282a36] p-3 mt-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                    Preview
                                </div>
                                <div className="text-sm">
                                    <span className="text-[#bd93f9] font-bold">{getFieldLabel(selectedField)}</span>
                                    {" "}
                                    <span className="text-[#f8f8f2]">{getOperatorLabel(selectedOperator)}</span>
                                    {" "}
                                    {!["is_defined", "is_not_defined"].includes(selectedOperator) && (
                                        <span className="text-[#50fa7b] font-bold">
                                            &quot;{comparisonValue || "(empty)"}&quot;
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-2 border-[#282a36] text-[#f8f8f2] hover:bg-[#1a1b26]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            handleConditionSave({
                                id: uuidv4(),
                                type: ConditionTypeEnum.PREVIOUS_OUTPUT,
                                data: {
                                    field: selectedField,
                                    operator: selectedOperator,
                                    value: comparisonValue,
                                },
                            });
                        }}
                        className="bg-[#bd93f9] hover:bg-[#bd93f9]/80 text-[#0b0b11] font-bold"
                    >
                        Add Condition
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
