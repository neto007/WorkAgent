import type { Agent } from "@/types/agent";
import { GitBranch, Settings } from "lucide-react";

interface ParallelAgentConfigProps {
    values: Partial<Agent>;
    onChange: (values: Partial<Agent>) => void;
    agents: Agent[];
    getAgentNameById: (id: string) => string;
}

export function ParallelAgentConfig({
    values,
    getAgentNameById,
}: ParallelAgentConfigProps) {
    return (
        <div className="space-y-6">
            <div className="border-2 border-[#6272a4] rounded-xl p-6 bg-[#0b0b11] shadow-neu-green">
                <h3
                    className="text-[12px] font-black text-[#6272a4] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
                >
                    <Settings className="h-4 w-4 text-[#bd93f9]" />
                    PARALLEL Agent Configuration
                </h3>

                <p className="text-xs text-[#6272a4] mb-6">
                    Configuration for parallel agents will be available soon. Configure sub-agents in the "Sub-Agents" tab.
                </p>

                {values.config?.sub_agents && values.config.sub_agents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {values.config.sub_agents.map((agentId) => (
                            <div
                                key={agentId}
                                className="flex items-center space-x-3 bg-[#1a1b26] p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-default"
                            >
                                <div className="h-10 w-10 rounded-xl bg-[#50fa7b] flex items-center justify-center border-2 border-black shadow-sm">
                                    <GitBranch className="h-5 w-5 text-black" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-white text-sm truncate">
                                        {getAgentNameById(agentId)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-[#6272a4] border-2 border-dashed border-[#6272a4] rounded-xl bg-[#1a1b26]/50">
                        <p className="text-sm font-black uppercase tracking-widest animate-pulse">
                            No parallel agents selected
                        </p>
                        <p className="text-xs mt-2 font-bold">
                            Add agents in the "Sub-Agents" tab to execute in parallel
                        </p>
                    </div>
                )}

                <div className="mt-6 p-4 bg-[#1a1b26]/30 rounded-md border border-[#1a1b26]">
                    <p className="text-xs text-[#6272a4] leading-relaxed uppercase tracking-wider font-medium">
                        <span className="text-[#50fa7b] font-bold">Simultaneous Protocol:</span> All listed agents will be executed simultaneously with the same input.
                        Responses will be aggregated at the end of execution.
                    </p>
                </div>
            </div>
        </div>
    );
}
