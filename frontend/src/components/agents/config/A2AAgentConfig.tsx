import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Agent } from "@/types/agent";
import { Settings } from "lucide-react";

interface A2AAgentConfigProps {
    values: Partial<Agent>;
    onChange: (values: Partial<Agent>) => void;
}

export function A2AAgentConfig({ values, onChange }: A2AAgentConfigProps) {
    return (
        <div className="space-y-6">
            <div className="border-2 border-[#6272a4] rounded-xl p-6 bg-[#0b0b11] shadow-neu">
                <h3 className="text-[12px] font-black text-[#6272a4] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#bd93f9]" />
                    A2A Agent Configuration
                </h3>

                <p className="text-xs text-[#6272a4] mb-6">
                    Configuration for a2a agents will be available soon. Configure sub-agents in the "Sub-Agents" tab.
                </p>

                <div className="space-y-4 pt-4 border-t-2 border-[#1a1b26]">
                    <div className="space-y-2">
                        <Label
                            htmlFor="agent_card_url"
                            className="text-[#f8f8f2] font-black text-xs uppercase tracking-wider block"
                        >
                            Agent Card URL
                        </Label>
                        <Input
                            id="agent_card_url"
                            value={values.agent_card_url || ""}
                            onChange={(e) =>
                                onChange({
                                    ...values,
                                    agent_card_url: e.target.value,
                                })
                            }
                            placeholder="https://example.com/.well-known/agent-card.json"
                            className="bg-[#050101] border-2 border-[#1a1b26] text-[#f8f8f2] placeholder:text-[#6272a4] focus:border-[#bd93f9] focus:shadow-neu-purple h-10 rounded-lg transition-all"
                        />
                    </div>

                    <div className="bg-[#1a1b26] p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
                        <p className="text-sm text-white leading-relaxed font-bold">
                            Provide the full URL for the JSON file of the Agent Card that describes this agent.
                        </p>
                        <p className="text-xs text-[#bd93f9] uppercase tracking-widest font-black">
                            Agent Cards contain metadata, capabilities descriptions and supported protocols.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
