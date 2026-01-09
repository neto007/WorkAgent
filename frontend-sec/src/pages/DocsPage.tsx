import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentationSection } from "@/components/profile/docs/DocumentationSection";
import { LabSection } from "@/components/profile/docs/LabSection";
import { useA2ALab } from "@/hooks/profile/useA2ALab";
import { CodeExamplesSection } from "@/components/profile/docs/CodeExamplesSection";
import { FrontendImplementationSection } from "@/components/profile/docs/FrontendImplementationSection";
import { TechnicalDetailsSection } from "@/components/profile/docs/TechnicalDetailsSection";
import { QuickStartTemplates } from "@/components/profile/docs/QuickStartTemplates";

import { useToast } from "@/hooks/useToast";

export default function DocsPage() {
    const labState = useA2ALab();
    const { toast } = useToast();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast("Copied!", {
            description: "Code copied to clipboard",
        });
    };

    return (
        <div className="bg-[#050101] text-[#f8f8f2] font-mono py-6 px-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="text-center mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                        A2A Protocol Documentation
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-[#0b0b11] border border-[#1a1b26] rounded-lg p-8">
                    <Tabs defaultValue="guide" className="w-full">
                        <TabsList className="flex bg-[#1a1b26] p-1 rounded-lg border border-[#282a36] mb-6 w-full">
                            <TabsTrigger
                                value="guide"
                                className="flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(189,147,249,0.3)] text-[#6272a4]"
                            >
                                Guide
                            </TabsTrigger>
                            <TabsTrigger
                                value="lab"
                                className="flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(189,147,249,0.3)] text-[#6272a4]"
                            >
                                Lab
                            </TabsTrigger>
                            <TabsTrigger
                                value="implementation"
                                className="flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(189,147,249,0.3)] text-[#6272a4]"
                            >
                                Implementation
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="guide">
                            <DocumentationSection copyToClipboard={handleCopy} />
                        </TabsContent>

                        <TabsContent value="lab" className="space-y-6">
                            <h2 className="text-[11px] font-black text-[#50fa7b] uppercase tracking-widest mb-6">
                                Interactive Testing Lab
                            </h2>
                            <div className="space-y-4">
                                <p className="text-[10px] text-[#6272a4] font-bold mb-4">
                                    Test agent interactions in real-time. Select a template below to get started.
                                </p>
                                <QuickStartTemplates onSelectTemplate={labState.handleTemplateSelection} />
                            </div>

                            {/* Lab Section */}
                            <LabSection
                                {...labState}
                                copyToClipboard={handleCopy}
                                renderStatusIndicator={() => null}
                                renderTypingIndicator={() => null}
                            />
                        </TabsContent>

                        <TabsContent value="implementation" className="space-y-6">
                            <h2 className="text-[11px] font-black text-[#8be9fd] uppercase tracking-widest mb-6">
                                Implementation Details
                            </h2>
                            <FrontendImplementationSection copyToClipboard={handleCopy} />
                            <TechnicalDetailsSection copyToClipboard={handleCopy} />
                            <CodeExamplesSection
                                agentUrl={labState.agentUrl}
                                apiKey={labState.apiKey}
                                jsonRpcRequest={{}}
                                curlExample="curl ..."
                                fetchExample="fetch ..."
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
