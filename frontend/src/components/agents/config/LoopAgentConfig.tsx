import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Agent } from "@/types/agent";
import { Repeat, Settings } from "lucide-react";

interface LoopAgentConfigProps {
    values: Partial<Agent>;
    onChange: (values: Partial<Agent>) => void;
    agents: Agent[];
    getAgentNameById: (id: string) => string;
}

export function LoopAgentConfig({
    values,
    onChange,
    getAgentNameById,
}: LoopAgentConfigProps) {
    const handleMaxIterationsChange = (value: string) => {
        const maxIterations = parseInt(value);
        onChange({
            ...values,
            config: {
                ...values.config,
                max_iterations: isNaN(maxIterations) ? undefined : maxIterations,
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="border-2 border-[#6272a4] rounded-xl p-6 bg-[#0b0b11] shadow-neu">
                <h3
                    className="text-[12px] font-black text-[#6272a4] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
                >
                    <Settings className="h-4 w-4 text-[#bd93f9]" />
                    LOOP Agent Configuration
                </h3>

                <p className="text-xs text-[#6272a4] mb-6">
                    Configuration for loop agents will be available soon. Configure sub-agents in the "Sub-Agents" tab.
                </p>

                <div className="flex items-center gap-4 mb-6">
                    <Label
                        htmlFor="max_iterations"
                        className="text-[#f8f8f2] font-bold text-xs uppercase tracking-wider whitespace-nowrap"
                    >
                        Max. Iterations
                    </Label>
                    <Input
                        id="max_iterations"
                        type="number"
                        min={1}
                        max={100}
                        value={values.config?.max_iterations || ""}
                        onChange={(e) => handleMaxIterationsChange(e.target.value)}
                        className="bg-[#050101] border-2 border-[#1a1b26] text-[#f8f8f2] focus:border-[#ff79c6] focus:shadow-neu-sm transition-all h-10 rounded-lg"
                    />
                </div>

                <h3
                    className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2"
                >
                    <Repeat className="h-4 w-4 text-[#ff79c6]" />
                    Execution Pattern (Cyclic)
                </h3>

                {values.config?.sub_agents && values.config.sub_agents.length > 0 ? (
                    <div className="space-y-3">
                        {values.config.sub_agents.map((agentId, index) => (
                            <div
                                key={`${agentId}-${index}`}
                                className="flex items-center space-x-3 bg-[#1a1b26] p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-default"
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-white text-sm">
                                        {getAgentNameById(agentId)}
                                    </div>
                                    <div className="text-[10px] text-[#6272a4] mt-1 flex items-center gap-2">
                                        STEP{" "}
                                        <Badge className="bg-[#ff79c6] text-black border-2 border-black px-2 h-5 font-black shadow-sm">
                                            {index + 1}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-[#6272a4] border-2 border-dashed border-[#6272a4] rounded-xl bg-[#1a1b26]/50">
                        <p className="text-sm font-black uppercase tracking-widest animate-pulse">
                            No cyclic sub-agents
                        </p>
                        <p className="text-xs mt-2 font-bold">
                            Add agents in the "Sub-Agents" tab to define the loop pattern
                        </p>
                    </div>
                )}

                <div className="mt-6 p-4 bg-[#1a1b26]/30 rounded-xl border-2 border-[#1a1b26] shadow-neu-sm">
                    <p className="text-xs text-[#6272a4] leading-relaxed uppercase tracking-wider font-medium">
                        <span className="text-[#ff79c6] font-bold">Relay Protocol:</span> The agents will execute sequentially in a loop until
                        the maximum number of iterations is reached or a stop condition is met.
                    </p>
                </div>
            </div>
        </div>
    );
}
