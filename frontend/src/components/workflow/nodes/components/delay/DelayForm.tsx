import { useState, useEffect } from "react";
import { Clock, Save, AlertCircle, HourglassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DelayType } from "../../nodeFunctions";

export function DelayForm({
    selectedNode,
    handleUpdateNode,
}: {
    selectedNode: any;
    handleUpdateNode: (node: any) => void;
}) {
    const [delay, setDelay] = useState<DelayType>({
        value: 1,
        unit: "seconds",
        description: "",
    });

    useEffect(() => {
        if (selectedNode?.data?.delay) {
            setDelay(selectedNode.data.delay);
        }
    }, [selectedNode]);

    const handleSave = () => {
        handleUpdateNode({
            ...selectedNode,
            data: {
                ...selectedNode.data,
                delay,
            },
        });
    };

    const getUnitLabel = (unit: string) => {
        const units: Record<string, string> = {
            seconds: "Seconds",
            minutes: "Minutes",
            hours: "Hours",
            days: "Days",
        };
        return units[unit] || unit;
    };

    const getTimeDescription = () => {
        const value = delay.value || 0;
        if (value <= 0) return "Invalid time";
        if (value === 1) {
            return `1 ${getUnitLabel(delay.unit).slice(0, -1)}`;
        }
        return `${value} ${getUnitLabel(delay.unit)}`;
    };

    return (
        <div className="flex flex-col h-full bg-[#0b0b11]">
            {/* Header */}
            <div className="p-4 border-b-2 border-[#1a1b26] flex-shrink-0">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-3">
                    Delay Configuration
                </h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#f8f8f2] font-bold">Duration:</span>
                        <Badge className="text-[10px] bg-[#f1fa8c]/20 text-[#f1fa8c] border-[#f1fa8c]/40">
                            {getTimeDescription().toUpperCase()}
                        </Badge>
                    </div>
                    <Select
                        value={delay.unit}
                        onValueChange={(value) =>
                            setDelay({
                                ...delay,
                                unit: value,
                            })
                        }
                    >
                        <SelectTrigger className="w-[120px] h-8 bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2]">
                            <SelectItem value="seconds">Seconds</SelectItem>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-[#f1fa8c]/10 border-2 border-[#f1fa8c]/30">
                        <div className="flex items-start gap-2">
                            <div className="bg-[#f1fa8c]/20 rounded-full p-1.5">
                                <Clock size={16} className="text-[#f1fa8c]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#f8f8f2] text-sm">Time Delay</h4>
                                <p className="text-xs text-[#6272a4] mt-1">
                                    Pause workflow execution for a specified time
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="delay-value" className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                            Delay Value
                        </Label>
                        <Input
                            id="delay-value"
                            type="number"
                            min="1"
                            className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2] focus-visible:ring-[#f1fa8c] focus-visible:border-[#f1fa8c]"
                            value={delay.value}
                            onChange={(e) =>
                                setDelay({
                                    ...delay,
                                    value: parseInt(e.target.value) || 1,
                                })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="delay-description" className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="delay-description"
                            className="bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2] min-h-[100px] resize-none focus-visible:ring-[#f1fa8c] focus-visible:border-[#f1fa8c]"
                            value={delay.description}
                            onChange={(e) =>
                                setDelay({
                                    ...delay,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Add a description for this delay"
                        />
                    </div>

                    {delay.value > 0 ? (
                        <div className="rounded-lg bg-[#1a1b26] border-2 border-[#282a36] p-3">
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                Preview
                            </div>
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#0b0b11]">
                                <div className="rounded-full bg-[#f1fa8c]/20 p-1.5">
                                    <HourglassIcon size={14} className="text-[#f1fa8c]" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm text-[#f1fa8c] font-bold">
                                        {getTimeDescription()} delay
                                    </span>
                                    {delay.description && (
                                        <p className="text-xs text-[#6272a4] mt-1">
                                            {delay.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg bg-[#1a1b26]/50 border-2 border-dashed border-[#282a36] p-6 flex flex-col items-center justify-center text-center">
                            <AlertCircle className="h-8 w-8 text-[#6272a4] mb-2" />
                            <p className="text-[#6272a4] text-sm">Please set a valid delay time</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-[#1a1b26] flex-shrink-0">
                <Button
                    className="w-full bg-[#f1fa8c] hover:bg-[#f1fa8c]/80 text-[#0b0b11] font-bold"
                    onClick={handleSave}
                >
                    <Save size={14} className="mr-2" />
                    Save Delay
                </Button>
            </div>
        </div>
    );
}
