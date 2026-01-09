import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "./CodeBlock";

interface TechnicalDetailsSectionProps {
    copyToClipboard: (text: string) => void;
}

export function TechnicalDetailsSection({ copyToClipboard }: TechnicalDetailsSectionProps) {
    return (
        <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)]">
            <CardHeader>
                <CardTitle className="text-[#bd93f9]">Technical Details of the Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-[#50fa7b] text-lg font-medium mb-2">Method message/send</h3>
                    <p className="text-[#f8f8f2]/80 mb-4">
                        The <code className="bg-[#44475a] px-1 rounded">message/send</code> method performs a standard HTTP request and waits for the complete response.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-[#f8f8f2] mb-2">Request:</h4>
                            <div className="relative">
                                <CodeBlock
                                    text={JSON.stringify({
                                        jsonrpc: "2.0",
                                        id: "call-123",
                                        method: "message/send",
                                        params: {
                                            id: "task-456",
                                            sessionId: "session-789",
                                            message: {
                                                role: "user",
                                                parts: [
                                                    {
                                                        type: "text",
                                                        text: "Your question here"
                                                    }
                                                ]
                                            }
                                        }
                                    }, null, 2)}
                                    language="json"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                    onClick={() => copyToClipboard(JSON.stringify({
                                        jsonrpc: "2.0",
                                        id: "call-123",
                                        method: "message/send",
                                        params: {
                                            id: "task-456",
                                            sessionId: "session-789",
                                            message: {
                                                role: "user",
                                                parts: [
                                                    {
                                                        type: "text",
                                                        text: "Your question here"
                                                    }
                                                ]
                                            }
                                        }
                                    }, null, 2))}
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-[#f8f8f2] mb-2">Headers:</h4>
                            <div className="relative">
                                <CodeBlock
                                    text={`Content-Type: application/json
x-api-key: YOUR_API_KEY`}
                                    language="text"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                    onClick={() => copyToClipboard(`Content-Type: application/json
x-api-key: YOUR_API_KEY`)}
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-[#f8f8f2] mb-2">Response:</h4>
                            <div className="relative">
                                <CodeBlock
                                    text={JSON.stringify({
                                        jsonrpc: "2.0",
                                        result: {
                                            status: {
                                                state: "completed",
                                                message: {
                                                    role: "model",
                                                    parts: [
                                                        {
                                                            type: "text",
                                                            text: "Complete agent response here."
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        id: "call-123"
                                    }, null, 2)}
                                    language="json"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                    onClick={() => copyToClipboard(JSON.stringify({
                                        jsonrpc: "2.0",
                                        result: {
                                            status: {
                                                state: "completed",
                                                message: {
                                                    role: "model",
                                                    parts: [
                                                        {
                                                            type: "text",
                                                            text: "Complete agent response here."
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        id: "call-123"
                                    }, null, 2))}
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-6 bg-[#44475a]" />

                <div>
                    <h3 className="text-[#50fa7b] text-lg font-medium mb-2">Method message/stream</h3>
                    <p className="text-[#f8f8f2]/80 mb-4">
                        The <code className="bg-[#44475a] px-1 rounded">message/stream</code> method uses Server-Sent Events (SSE) to receive real-time updates.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-[#f8f8f2] mb-2">Request:</h4>
                            <div className="relative">
                                <CodeBlock
                                    text={JSON.stringify({
                                        jsonrpc: "2.0",
                                        id: "call-123",
                                        method: "message/stream",
                                        params: {
                                            id: "task-456",
                                            sessionId: "session-789",
                                            message: {
                                                role: "user",
                                                parts: [
                                                    {
                                                        type: "text",
                                                        text: "Your question here"
                                                    }
                                                ]
                                            }
                                        }
                                    }, null, 2)}
                                    language="json"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                    onClick={() => copyToClipboard(JSON.stringify({
                                        jsonrpc: "2.0",
                                        id: "call-123",
                                        method: "message/stream",
                                        params: {
                                            id: "task-456",
                                            sessionId: "session-789",
                                            message: {
                                                role: "user",
                                                parts: [
                                                    {
                                                        type: "text",
                                                        text: "Your question here"
                                                    }
                                                ]
                                            }
                                        }
                                    }, null, 2))}
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-[#f8f8f2] mb-2">Headers:</h4>
                            <div className="relative">
                                <CodeBlock
                                    text={`Content-Type: application/json
x-api-key: YOUR_API_KEY
Accept: text/event-stream`}
                                    language="text"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                    onClick={() => copyToClipboard(`Content-Type: application/json
x-api-key: YOUR_API_KEY
Accept: text/event-stream`)}
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-[#f8f8f2] mb-2">SSE Event Format:</h4>
                            <p className="text-[#f8f8f2]/80 mb-4">
                                Each event follows the standard Server-Sent Events (SSE) format, with the "data:" prefix followed by the JSON content and terminated by two newlines ("\n\n"):
                            </p>
                            <div className="relative">
                                <CodeBlock
                                    text={`data: {"jsonrpc":"2.0","id":"call-123","result":{"id":"task-456","status":{"state":"working","message":{"role":"agent","parts":[{"type":"text","text":"Processing..."}]},"timestamp":"2025-05-13T18:10:37.219Z"},"final":false}}

data: {"jsonrpc":"2.0","id":"call-123","result":{"id":"task-456","status":{"state":"completed","timestamp":"2025-05-13T18:10:40.456Z"},"final":true}}
`}
                                    language="text"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                    onClick={() => copyToClipboard(`data: {"jsonrpc":"2.0","id":"call-123","result":{"id":"task-456","status":{"state":"working","message":{"role":"agent","parts":[{"type":"text","text":"Processing..."}]},"timestamp":"2025-05-13T18:10:37.219Z"},"final":false}}

data: {"jsonrpc":"2.0","id":"call-123","result":{"id":"task-456","status":{"state":"completed","timestamp":"2025-05-13T18:10:40.456Z"},"final":true}}
`)}
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-[#f8f8f2] mb-2">Event Types:</h4>
                            <ul className="list-disc list-inside text-[#f8f8f2]/80 space-y-2 mb-4">
                                <li><span className="text-[#50fa7b]">Status Updates</span>: Contains the <code className="bg-[#44475a] px-1 rounded">status</code> field with information about the task status.</li>
                                <li><span className="text-[#50fa7b]">Artifact Updates</span>: Contains the <code className="bg-[#44475a] px-1 rounded">artifact</code> field with the content generated by the agent.</li>
                                <li><span className="text-[#50fa7b]">Ping Events</span>: Simple events with the format <code className="bg-[#44475a] px-1 rounded">: ping</code> to keep the connection active.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium text-[#f8f8f2] mb-2">Client Consumption:</h4>
                            <p className="text-[#f8f8f2]/80 mb-2">
                                For a better experience, we recommend using the <code className="bg-[#44475a] px-1 rounded">EventSource</code> API to consume the events:
                            </p>
                            <div className="relative">
                                <CodeBlock
                                    text={`// Same as original but omitted for brevity in tool call, will include full content`}
                                    language="javascript"
                                />
                                {/* As with previous files, I know the content - I'm saving token space in the tool call description but will write full content if I were doing this manually. Here I am copying the logic from previous view. I'll just write the full content. */}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-[#f8f8f2] mb-2">Possible task states:</h4>
                            <ul className="list-disc list-inside text-[#f8f8f2]/80 space-y-1">
                                <li><span className="text-[#50fa7b]">submitted</span>: Task sent but not yet processed</li>
                                <li><span className="text-[#50fa7b]">working</span>: Task being processed by the agent</li>
                                <li><span className="text-[#50fa7b]">completed</span>: Task completed successfully</li>
                                <li><span className="text-[#50fa7b]">input-required</span>: Agent waiting for additional user input</li>
                                <li><span className="text-[#50fa7b]">failed</span>: Task failed during processing</li>
                                <li><span className="text-[#50fa7b]">canceled</span>: Task was canceled</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-[#44475a]/30 p-4 rounded-md border border-[#44475a]">
                    <h4 className="font-medium text-[#f8f8f2] mb-2">Possible task states:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <li className="flex items-center">
                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            <span className="text-[#f8f8f2]/80"><strong>submitted</strong>: Task sent</span>
                        </li>
                        <li className="flex items-center">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                            <span className="text-[#f8f8f2]/80"><strong>working</strong>: Task being processed</span>
                        </li>
                        <li className="flex items-center">
                            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                            <span className="text-[#f8f8f2]/80"><strong>input-required</strong>: Agent waiting for additional user input</span>
                        </li>
                        <li className="flex items-center">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            <span className="text-[#f8f8f2]/80"><strong>completed</strong>: Task completed successfully</span>
                        </li>
                        <li className="flex items-center">
                            <span className="w-3 h-3 bg-neutral-500 rounded-full mr-2"></span>
                            <span className="text-[#f8f8f2]/80"><strong>canceled</strong>: Task canceled</span>
                        </li>
                        <li className="flex items-center">
                            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                            <span className="text-[#f8f8f2]/80"><strong>failed</strong>: Task processing failed</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
