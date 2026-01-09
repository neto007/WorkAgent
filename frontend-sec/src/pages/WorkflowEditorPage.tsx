import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Play } from 'lucide-react';
import { toast } from 'sonner';
import { getAgent, updateWorkflow } from '@/services/agentService';
import type { Agent } from '@/types/agent';
import Canva from '@/components/workflow/Canva';
import { DnDProvider } from '@/contexts/DnDContext';
import { AgentTestChatModal } from '@/components/workflow/nodes/components/agent/AgentTestChatModal';
import { useClient } from '@/contexts/ClientContext';

export default function WorkflowEditorPage() {
    const { agentId } = useParams<{ agentId: string }>();
    const navigate = useNavigate();
    const canvasRef = useRef<any>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const { clientId } = useClient();

    useEffect(() => {
        const loadAgent = async () => {
            if (!agentId || !clientId) return;
            try {
                const response = await getAgent(agentId, clientId);
                setAgent(response.data);
            } catch (error) {
                console.error('Failed to load agent:', error);
                toast.error('Failed to load agent');
            } finally {
                setIsLoading(false);
            }
        };
        loadAgent();
    }, [agentId, clientId]);

    const handleSave = async () => {
        if (!agent || !canvasRef.current) return;

        setIsSaving(true);
        try {
            const flowData = canvasRef.current.getFlowData();
            await updateWorkflow(agent.id, flowData);
            toast.success('Workflow saved successfully');
        } catch (error) {
            console.error('Failed to save workflow:', error);
            toast.error('Failed to save workflow');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestWorkflow = () => {
        if (!agent) {
            toast.error('No agent selected');
            return;
        }
        setIsTestModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0b0b11]">
                <div className="text-[#f8f8f2]">Loading...</div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0b0b11]">
                <div className="text-[#ff5555]">Agent not found</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0b0b11]">
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-[#1a1b26] to-[#282a36] border-b-2 border-[#282a36] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/agents')}
                            className="bg-[#1a1b26] hover:bg-[#282a36] text-[#f8f8f2] border-2 border-[#282a36] hover:border-[#bd93f9] transition-all"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                        <div className="h-6 w-px bg-[#282a36] mx-2" />
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleTestWorkflow}
                                disabled={!agent}
                                className="bg-[#50fa7b] hover:bg-[#50fa7b]/80 text-[#0b0b11] font-black transition-all shadow-[0_0_15px_rgba(80,250,123,0.3)] hover:shadow-[0_0_20px_rgba(80,250,123,0.5)] text-[10px] uppercase tracking-widest"
                            >
                                <Play size={14} className="mr-2" />
                                Test Workflow
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-[#bd93f9] hover:bg-[#bd93f9]/80 text-[#0b0b11] font-black transition-all shadow-[0_0_15px_rgba(189,147,249,0.3)] hover:shadow-[0_0_20px_rgba(189,147,249,0.5)] text-[10px] uppercase tracking-widest"
                            >
                                <Save size={14} className="mr-2" />
                                {isSaving ? 'Saving...' : 'Save Workflow'}
                            </Button>
                        </div>
                    </div>

                    {agent && (
                        <div className="bg-[#1a1b26] px-4 py-2 rounded-lg border-2 border-[#282a36]">
                            <h2 className="text-[#f8f8f2] font-black text-sm uppercase tracking-widest">
                                {agent.name} <span className="text-[#6272a4]">/ workflow</span>
                            </h2>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <ReactFlowProvider>
                    <DnDProvider>
                        <Canva
                            ref={canvasRef}
                            agent={agent}
                        />
                    </DnDProvider>
                </ReactFlowProvider>
            </div>

            {/* Test Modal */}
            {isTestModalOpen && agent && (
                <AgentTestChatModal
                    open={isTestModalOpen}
                    onOpenChange={setIsTestModalOpen}
                    agent={agent}
                    canvasRef={canvasRef}
                />
            )}
        </div>
    );
}
