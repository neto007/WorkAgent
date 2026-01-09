import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import { HttpLabForm } from "./HttpLabForm";
import { StreamLabForm } from "./StreamLabForm";
import { CodeBlock } from "./CodeBlock";

interface LabSectionProps {
    agentUrl: string;
    setAgentUrl: (url: string) => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    message: string;
    setMessage: (message: string) => void;
    sessionId: string;
    setSessionId: (id: string) => void;
    taskId: string;
    setTaskId: (id: string) => void;
    callId: string;
    setCallId: (id: string) => void;
    a2aMethod: string;
    setA2aMethod: (method: string) => void;
    authMethod: string;
    setAuthMethod: (method: string) => void;
    generateNewIds: () => void;
    sendRequest: () => Promise<void>;
    sendStreamRequestWithEventSource: () => Promise<void>;
    isLoading: boolean;
    isStreaming: boolean;
    streamResponse: string;
    streamStatus: string;
    streamHistory: string[];
    streamComplete: boolean;
    response: string;
    copyToClipboard: (text: string) => void;
    renderStatusIndicator: () => JSX.Element | null;
    renderTypingIndicator: () => JSX.Element | null;
}

export function LabSection({
    agentUrl,
    setAgentUrl,
    apiKey,
    setApiKey,
    message,
    setMessage,
    sessionId,
    setSessionId,
    taskId,
    setTaskId,
    callId,
    setCallId,
    a2aMethod,
    setA2aMethod,
    authMethod,
    setAuthMethod,
    generateNewIds,
    sendRequest,
    sendStreamRequestWithEventSource,
    isLoading,
    isStreaming,
    streamResponse,
    renderStatusIndicator,
    renderTypingIndicator,
    response,
    copyToClipboard,
    streamStatus,
    streamHistory
}: LabSectionProps) {
    const [labMode, setLabMode] = useState("http");

    return (
        <>
            <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)] mb-6">
                <CardHeader>
                    <CardTitle className="text-[#50fa7b]">A2A Test Lab</CardTitle>
                    <CardDescription className="text-[#f8f8f2]/60">
                        Test your A2A agent with different communication methods
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="http" onValueChange={setLabMode}>
                        <TabsList className="bg-[#44475a]/50 border-[#44475a] mb-4">
                            <TabsTrigger value="http" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black">
                                HTTP Request
                            </TabsTrigger>
                            <TabsTrigger value="stream" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black">
                                Streaming
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="http">
                            <HttpLabForm
                                agentUrl={agentUrl}
                                setAgentUrl={setAgentUrl}
                                apiKey={apiKey}
                                setApiKey={setApiKey}
                                message={message}
                                setMessage={setMessage}
                                sessionId={sessionId}
                                setSessionId={setSessionId}
                                taskId={taskId}
                                setTaskId={setTaskId}
                                callId={callId}
                                setCallId={setCallId}
                                a2aMethod={a2aMethod}
                                setA2aMethod={setA2aMethod}
                                authMethod={authMethod}
                                setAuthMethod={setAuthMethod}
                                generateNewIds={generateNewIds}
                                sendRequest={sendRequest}
                                isLoading={isLoading}
                            />
                        </TabsContent>

                        <TabsContent value="stream">
                            <StreamLabForm
                                agentUrl={agentUrl}
                                setAgentUrl={setAgentUrl}
                                apiKey={apiKey}
                                setApiKey={setApiKey}
                                message={message}
                                setMessage={setMessage}
                                sessionId={sessionId}
                                setSessionId={setSessionId}
                                taskId={taskId}
                                setTaskId={setTaskId}
                                callId={callId}
                                setCallId={setCallId}
                                authMethod={authMethod}
                                sendStreamRequest={sendStreamRequestWithEventSource}
                                isStreaming={isStreaming}
                                streamResponse={streamResponse}
                                streamStatus={streamStatus}
                                streamHistory={streamHistory}
                                renderStatusIndicator={renderStatusIndicator}
                                renderTypingIndicator={renderTypingIndicator}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {response && labMode === "http" && (
                <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)]">
                    <CardHeader>
                        <CardTitle className="text-[#50fa7b]">Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <CodeBlock
                                text={response}
                                language="json"
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                onClick={() => copyToClipboard(response)}
                            >
                                <ClipboardCopy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
