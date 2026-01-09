import { Badge } from "@/components/ui/badge";
import type { Agent } from "@/types/agent";
import { Settings } from "lucide-react";

interface SequentialAgentConfigProps {
    values: Partial<Agent>;
    onChange: (values: Partial<Agent>) => void;
    agents: Agent[];
    getAgentNameById: (id: string) => string;
}

export function SequentialAgentConfig({
    values,
    getAgentNameById,
}: SequentialAgentConfigProps) {
    return (
        <div className="space-y-6">
            <div className="border-2 border-[#6272a4] rounded-xl p-6 bg-[#0b0b11] shadow-neu-purple">
                <h3
                    className="text-[12px] font-black text-[#6272a4] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
                >
                    <Settings className="h-4 w-4 text-[#bd93f9]" />
                    SEQUENTIAL Agent Configuration
                </h3>

                <p className="text-xs text-[#6272a4] mb-6">
                    Configuration for sequential agents will be available soon. Configure sub-agents in the "Sub-Agents" tab.
                </p>

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
                                    <div className="text-xs text-[#6272a4] mt-1 flex items-center gap-2">
                                        Executed on{" "}
                                        <Badge className="bg-[#bd93f9] text-black border-2 border-black text-[10px] uppercase font-black tracking-tighter h-6 px-2 shadow-sm">
                                            Position {index + 1}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-[#6272a4] border-2 border-dashed border-[#6272a4] rounded-xl bg-[#1a1b26]/50">
                        <p className="text-sm font-black uppercase tracking-widest animate-pulse">
                            No sub-agents selected
                        </p>
                        <p className="text-xs mt-2 font-bold">
                            Add agents in the "Sub-Agents" tab to define the execution order
                        </p>
                    </div>
                )}

                <div className="mt-6 p-4 bg-[#1a1b26]/30 rounded-md border border-[#1a1b26]">
                    <p className="text-xs text-[#6272a4] leading-relaxed uppercase tracking-wider font-medium">
                        <span className="text-[#bd93f9] font-bold">Protocol Info:</span> The agents will be executed sequentially.
                        The output of each agent will be provided as input to the next agent in the sequence.
                    </p>
                </div>
            </div>
        </div>
    );
}
