import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentationSection } from "../docs/DocumentationSection";
import { LabSection } from "../docs/LabSection";
import { useA2ALab } from "@/hooks/profile/useA2ALab";
import { CodeExamplesSection } from "../docs/CodeExamplesSection";
import { FrontendImplementationSection } from "../docs/FrontendImplementationSection";
import { TechnicalDetailsSection } from "../docs/TechnicalDetailsSection";
import { QuickStartTemplates } from "../docs/QuickStartTemplates";

export function DocumentationTab() {
    const labState = useA2ALab();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // Assuming useA2ALab or a parent handles toast, but here we can just do nothing or use local toast
        // The DocumentationSection uses a prop copyToClipboard.
        // We can pass a simple wrapper.
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="guide" className="w-full">
                <TabsList className="bg-[#44475a]/50 border-[#44475a] mb-6 p-1 w-full justify-start">
                    <TabsTrigger value="guide" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black">
                        User Guide
                    </TabsTrigger>
                    <TabsTrigger value="lab" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black">
                        Interactive Lab
                    </TabsTrigger>
                    <TabsTrigger value="implementation" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black">
                        Implementation
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="guide">
                    <DocumentationSection copyToClipboard={handleCopy} />
                </TabsContent>

                <TabsContent value="lab">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-[#50fa7b] mb-4">A2A Testing Lab</h3>
                        <QuickStartTemplates onSelectTemplate={labState.handleTemplateSelection} />
                        <div className="mt-6">
                            <LabSection
                                {...labState}
                                copyToClipboard={handleCopy}
                                renderStatusIndicator={() => null} // TODO: Implement if needed, or rely on LabSection default
                                renderTypingIndicator={() => null}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="implementation">
                    <div className="space-y-8">
                        <FrontendImplementationSection copyToClipboard={handleCopy} />
                        <TechnicalDetailsSection copyToClipboard={handleCopy} />
                        <CodeExamplesSection
                            agentUrl={labState.agentUrl}
                            apiKey={labState.apiKey}
                            jsonRpcRequest={{}}
                            curlExample="curl ..."
                            fetchExample="fetch ..."
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
