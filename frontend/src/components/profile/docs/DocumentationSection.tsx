import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ClipboardCopy,
    Info,
    ExternalLink,
    Users,
    Shield,
    Zap,
    Network,
    FileText,
    MessageSquare,
    Settings,
    AlertCircle,
    CheckCircle2,
    Globe
} from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface DocumentationSectionProps {
    copyToClipboard: (text: string) => void;
}

export function DocumentationSection({ copyToClipboard }: DocumentationSectionProps) {
    const quickStartExample = {
        jsonrpc: "2.0",
        id: "req-001",
        method: "message/send",
        params: {
            message: {
                role: "user",
                parts: [
                    {
                        type: "text",
                        text: "Hello! Can you help me analyze this data?"
                    }
                ],
                messageId: "6dbc13b5-bd57-4c2b-b503-24e381b6c8d6"
            }
        }
    };

    const streamingExample = {
        jsonrpc: "2.0",
        id: "req-002",
        method: "message/stream",
        params: {
            message: {
                role: "user",
                parts: [
                    {
                        type: "text",
                        text: "Generate a detailed report on market trends"
                    }
                ],
                messageId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
            }
        }
    };

    const fileUploadExample = {
        jsonrpc: "2.0",
        id: "req-003",
        method: "message/send",
        params: {
            message: {
                role: "user",
                parts: [
                    {
                        type: "text",
                        text: "Analyze this image and highlight any faces."
                    },
                    {
                        type: "file",
                        file: {
                            name: "input_image.png",
                            mimeType: "image/png",
                            bytes: "iVBORw0KGgoAAAANSUhEUgAAAAUA..."
                        }
                    }
                ],
                messageId: "8f0dc03c-4c65-4a14-9b56-7e8b9f2d1a3c"
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <Card className="bg-gradient-to-br from-[#50fa7b]/10 to-[#bd93f9]/10 border-[#50fa7b]/20 text-[#f8f8f2]">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex items-center space-x-2 bg-[#50fa7b]/20 px-4 py-2 rounded-full">
                            <Network className="h-6 w-6 text-[#50fa7b]" />
                            <span className="font-bold text-[#50fa7b]">Agent2Agent Protocol</span>
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#50fa7b] to-[#bd93f9] bg-clip-text text-transparent">
                        The Standard for AI Agent Communication
                    </CardTitle>
                    <p className="text-lg text-[#f8f8f2]/80 mt-4 max-w-3xl mx-auto">
                        A2A is Google's open protocol enabling seamless communication and interoperability
                        between AI agents across different platforms, providers, and architectures.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <a
                            href="https://google.github.io/A2A/specification"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center bg-[#50fa7b]/20 hover:bg-[#50fa7b]/30 px-4 py-2 rounded-lg transition-colors border border-[#50fa7b]/20"
                        >
                            <FileText className="h-4 w-4 mr-2 text-[#50fa7b]" />
                            <span className="text-[#50fa7b]">Official Specification</span>
                            <ExternalLink className="h-3 w-3 ml-2 text-[#50fa7b]" />
                        </a>
                        <a
                            href="https://github.com/google/A2A"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center bg-[#bd93f9]/20 hover:bg-[#bd93f9]/30 px-4 py-2 rounded-lg transition-colors border border-[#bd93f9]/20"
                        >
                            <Globe className="h-4 w-4 mr-2 text-[#bd93f9]" />
                            <span className="text-[#bd93f9]">GitHub Repository</span>
                            <ExternalLink className="h-3 w-3 ml-2 text-[#bd93f9]" />
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* Key Features */}
            <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)]">
                <CardHeader>
                    <CardTitle className="text-[#50fa7b] flex items-center">
                        <Zap className="h-5 w-5 mr-2" />
                        Key Features & Capabilities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-start space-x-3">
                            <div className="bg-[#50fa7b]/20 p-2 rounded-lg">
                                <MessageSquare className="h-5 w-5 text-[#50fa7b]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#f8f8f2]">Multi-turn Conversations</h3>
                                <p className="text-sm text-[#f8f8f2]/60">Support for complex, contextual dialogues between agents</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="bg-[#bd93f9]/20 p-2 rounded-lg">
                                <FileText className="h-5 w-5 text-[#bd93f9]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#f8f8f2]">File Exchange</h3>
                                <p className="text-sm text-[#f8f8f2]/60">Upload and download files with proper MIME type handling</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="bg-[#ff79c6]/20 p-2 rounded-lg">
                                <Zap className="h-5 w-5 text-[#ff79c6]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#f8f8f2]">Real-time Streaming</h3>
                                <p className="text-sm text-[#f8f8f2]/60">Server-Sent Events for live response streaming</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="bg-[#ffb86c]/20 p-2 rounded-lg">
                                <Settings className="h-5 w-5 text-[#ffb86c]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#f8f8f2]">Task Management</h3>
                                <p className="text-sm text-[#f8f8f2]/60">Track, query, and cancel long-running tasks</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="bg-[#ff5555]/20 p-2 rounded-lg">
                                <Shield className="h-5 w-5 text-[#ff5555]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#f8f8f2]">Enterprise Security</h3>
                                <p className="text-sm text-[#f8f8f2]/60">Bearer tokens, API keys, and HTTPS enforcement</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="bg-[#50fa7b]/20 p-2 rounded-lg">
                                <Users className="h-5 w-5 text-[#50fa7b]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#f8f8f2]">Agent Discovery</h3>
                                <p className="text-sm text-[#f8f8f2]/60">Standardized agent cards for capability discovery</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Protocol Methods */}
            <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)]">
                <CardHeader>
                    <CardTitle className="text-[#50fa7b]">Protocol Methods</CardTitle>
                    <p className="text-[#f8f8f2]/60">A2A supports multiple RPC methods for different interaction patterns</p>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="messaging" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-[#44475a]/50 border-[#44475a]">
                            <TabsTrigger value="messaging" className="data-[state=active]:bg-[#50fa7b] data-[state=active]:text-black">
                                Messaging
                            </TabsTrigger>
                            <TabsTrigger value="tasks" className="data-[state=active]:bg-[#50fa7b] data-[state=active]:text-black">
                                Task Management
                            </TabsTrigger>
                            <TabsTrigger value="discovery" className="data-[state=active]:bg-[#50fa7b] data-[state=active]:text-black">
                                Discovery
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="messaging" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#44475a]/30 p-4 rounded-lg border border-[#44475a]">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Badge variant="outline" className="border-[#50fa7b] text-[#50fa7b]">message/send</Badge>
                                        <CheckCircle2 className="h-4 w-4 text-[#50fa7b]" />
                                    </div>
                                    <h4 className="font-semibold text-[#f8f8f2] mb-2">Standard HTTP Request</h4>
                                    <p className="text-sm text-[#f8f8f2]/60 mb-3">
                                        Send a message and receive a complete response after processing is finished.
                                    </p>
                                    <ul className="text-xs text-[#f8f8f2]/60 space-y-1">
                                        <li>• Single request/response cycle</li>
                                        <li>• Best for simple queries</li>
                                        <li>• Lower complexity implementation</li>
                                        <li>• Synchronous operation</li>
                                    </ul>
                                </div>

                                <div className="bg-[#44475a]/30 p-4 rounded-lg border border-[#44475a]">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Badge variant="outline" className="border-[#bd93f9] text-[#bd93f9]">message/stream</Badge>
                                        <Zap className="h-4 w-4 text-[#bd93f9]" />
                                    </div>
                                    <h4 className="font-semibold text-[#f8f8f2] mb-2">Real-time Streaming</h4>
                                    <p className="text-sm text-[#f8f8f2]/60 mb-3">
                                        Receive partial responses in real-time via Server-Sent Events.
                                    </p>
                                    <ul className="text-xs text-[#f8f8f2]/60 space-y-1">
                                        <li>• Progressive response delivery</li>
                                        <li>• Better UX for long tasks</li>
                                        <li>• Live status updates</li>
                                        <li>• Asynchronous operation</li>
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tasks" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#44475a]/30 p-4 rounded-lg border border-[#44475a]">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Badge variant="outline" className="border-[#ff79c6] text-[#ff79c6]">tasks/get</Badge>
                                        <Settings className="h-4 w-4 text-[#ff79c6]" />
                                    </div>
                                    <h4 className="font-semibold text-[#f8f8f2] mb-2">Query Task Status</h4>
                                    <p className="text-sm text-[#f8f8f2]/60 mb-3">
                                        Check the status, progress, and results of a specific task.
                                    </p>
                                    <ul className="text-xs text-[#f8f8f2]/60 space-y-1">
                                        <li>• Real-time status checking</li>
                                        <li>• Progress monitoring</li>
                                        <li>• Result retrieval</li>
                                        <li>• Error diagnosis</li>
                                    </ul>
                                </div>

                                <div className="bg-[#44475a]/30 p-4 rounded-lg border border-[#44475a]">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Badge variant="outline" className="border-[#ff5555] text-[#ff5555]">tasks/cancel</Badge>
                                        <AlertCircle className="h-4 w-4 text-[#ff5555]" />
                                    </div>
                                    <h4 className="font-semibold text-[#f8f8f2] mb-2">Cancel Task</h4>
                                    <p className="text-sm text-[#f8f8f2]/60 mb-3">
                                        Terminate a running task before completion.
                                    </p>
                                    <ul className="text-xs text-[#f8f8f2]/60 space-y-1">
                                        <li>• Graceful task termination</li>
                                        <li>• Resource cleanup</li>
                                        <li>• Cost optimization</li>
                                        <li>• User control</li>
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="discovery" className="space-y-4">
                            <div className="bg-[#44475a]/30 p-4 rounded-lg border border-[#44475a]">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Badge variant="outline" className="border-[#50fa7b] text-[#50fa7b]">agent/authenticatedExtendedCard</Badge>
                                    <Users className="h-4 w-4 text-[#50fa7b]" />
                                </div>
                                <h4 className="font-semibold text-[#f8f8f2] mb-2">Agent Discovery</h4>
                                <p className="text-sm text-[#f8f8f2]/60 mb-3">
                                    Retrieve detailed information about agent capabilities, skills, and requirements.
                                </p>
                                <ul className="text-xs text-[#f8f8f2]/60 space-y-1">
                                    <li>• Agent capability discovery</li>
                                    <li>• Skill and tool enumeration</li>
                                    <li>• Authentication requirements</li>
                                    <li>• API version compatibility</li>
                                </ul>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Code Examples */}
            <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)]">
                <CardHeader>
                    <CardTitle className="text-[#50fa7b]">Quick Start Examples</CardTitle>
                    <p className="text-[#f8f8f2]/60">Ready-to-use JSON-RPC examples based on the official A2A specification</p>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-[#44475a]/50 border-[#44475a]">
                            <TabsTrigger value="basic" className="data-[state=active]:bg-[#50fa7b] data-[state=active]:text-black">
                                Basic Message
                            </TabsTrigger>
                            <TabsTrigger value="streaming" className="data-[state=active]:bg-[#50fa7b] data-[state=active]:text-black">
                                Streaming
                            </TabsTrigger>
                            <TabsTrigger value="files" className="data-[state=active]:bg-[#50fa7b] data-[state=active]:text-black">
                                File Upload
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                            <div className="relative">
                                <CodeBlock
                                    text={JSON.stringify(quickStartExample, null, 2)}
                                    language="json"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                    onClick={() => copyToClipboard(JSON.stringify(quickStartExample, null, 2))}
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="bg-[#bd93f9]/10 border border-[#bd93f9]/20 rounded-lg p-4">
                                <div className="flex items-start space-x-2">
                                    <Info className="h-4 w-4 text-[#bd93f9] mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-[#bd93f9] font-medium">Key Points:</p>
                                        <ul className="text-[#bd93f9]/80 mt-1 space-y-1">
                                            <li>• Uses <code className="bg-[#bd93f9]/20 px-1 rounded">message/send</code> for standard HTTP requests</li>
                                            <li>• <code className="bg-[#bd93f9]/20 px-1 rounded">messageId</code> must be a valid UUID v4</li>
                                            <li>• Response contains task ID, status, and artifacts</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="streaming" className="space-y-4">
                            <div className="relative">
                                <CodeBlock
                                    text={JSON.stringify(streamingExample, null, 2)}
                                    language="json"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                    onClick={() => copyToClipboard(JSON.stringify(streamingExample, null, 2))}
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="bg-[#ff79c6]/10 border border-[#ff79c6]/20 rounded-lg p-4">
                                <div className="flex items-start space-x-2">
                                    <Zap className="h-4 w-4 text-[#ff79c6] mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-[#ff79c6] font-medium">Streaming Features:</p>
                                        <ul className="text-[#ff79c6]/80 mt-1 space-y-1">
                                            <li>• Real-time Server-Sent Events (SSE)</li>
                                            <li>• Progressive content delivery</li>
                                            <li>• Status updates: submitted → working → completed</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="files" className="space-y-4">
                            <div className="relative">
                                <CodeBlock
                                    text={JSON.stringify(fileUploadExample, null, 2)}
                                    language="json"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                                    onClick={() => copyToClipboard(JSON.stringify(fileUploadExample, null, 2))}
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="bg-[#50fa7b]/10 border border-[#50fa7b]/20 rounded-lg p-4">
                                <div className="flex items-start space-x-2">
                                    <FileText className="h-4 w-4 text-[#50fa7b] mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-[#50fa7b] font-medium">File Handling:</p>
                                        <ul className="text-[#50fa7b]/80 mt-1 space-y-1">
                                            <li>• Support for multiple file types (images, documents, etc.)</li>
                                            <li>• Base64 encoding for binary data</li>
                                            <li>• Proper MIME type specification</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Security & Best Practices */}
            <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)]">
                <CardHeader>
                    <CardTitle className="text-[#50fa7b] flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Security & Best Practices
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-[#f8f8f2] font-semibold mb-3 flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-[#50fa7b]" />
                                Authentication Methods
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-[#44475a]/30 p-3 rounded-lg border border-[#44475a]">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <code className="text-[#50fa7b] text-sm">x-api-key</code>
                                        <Badge variant="outline" className="text-xs border-[#50fa7b] text-[#50fa7b]">Recommended</Badge>
                                    </div>
                                    <p className="text-xs text-[#f8f8f2]/60">Custom header for API key authentication</p>
                                </div>
                                <div className="bg-[#44475a]/30 p-3 rounded-lg border border-[#44475a]">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <code className="text-[#bd93f9] text-sm">Authorization: Bearer</code>
                                        <Badge variant="outline" className="text-xs border-[#bd93f9] text-[#bd93f9]">Standard</Badge>
                                    </div>
                                    <p className="text-xs text-[#f8f8f2]/60">OAuth 2.0 Bearer token authentication</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[#f8f8f2] font-semibold mb-3 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-[#ffb86c]" />
                                Security Requirements
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle2 className="h-3 w-3 text-[#50fa7b]" />
                                    <span className="text-[#f8f8f2]/80">HTTPS/TLS encryption required</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckCircle2 className="h-3 w-3 text-[#50fa7b]" />
                                    <span className="text-[#f8f8f2]/80">Input validation on all parameters</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckCircle2 className="h-3 w-3 text-[#50fa7b]" />
                                    <span className="text-[#f8f8f2]/80">Rate limiting and resource controls</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckCircle2 className="h-3 w-3 text-[#50fa7b]" />
                                    <span className="text-[#f8f8f2]/80">Proper CORS configuration</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#ffb86c]/10 border border-[#ffb86c]/20 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-[#ffb86c] mt-0.5" />
                            <div className="text-sm">
                                <p className="text-[#ffb86c] font-medium">Important:</p>
                                <p className="text-[#ffb86c]/80 mt-1">
                                    Always obtain API credentials out-of-band. Never include sensitive authentication
                                    data in client-side code or version control systems.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* A2A vs MCP */}
            <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)]">
                <CardHeader>
                    <CardTitle className="text-[#50fa7b] flex items-center">
                        <Network className="h-5 w-5 mr-2" />
                        A2A vs Model Context Protocol (MCP)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#44475a]/30 border-b border-[#44475a]">
                                    <th className="p-4 text-left text-[#f8f8f2]/80">Aspect</th>
                                    <th className="p-4 text-left text-[#50fa7b]">Agent2Agent (A2A)</th>
                                    <th className="p-4 text-left text-[#bd93f9]">Model Context Protocol (MCP)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-[#44475a]">
                                    <td className="p-4 text-[#f8f8f2]/80 font-medium">Purpose</td>
                                    <td className="p-4 text-[#f8f8f2]/60">Agent-to-agent communication</td>
                                    <td className="p-4 text-[#f8f8f2]/60">Model-to-tool/resource integration</td>
                                </tr>
                                <tr className="border-b border-[#44475a]">
                                    <td className="p-4 text-[#f8f8f2]/80 font-medium">Use Case</td>
                                    <td className="p-4 text-[#f8f8f2]/60">AI agents collaborating as peers</td>
                                    <td className="p-4 text-[#f8f8f2]/60">AI models accessing external capabilities</td>
                                </tr>
                                <tr className="border-b border-[#44475a]">
                                    <td className="p-4 text-[#f8f8f2]/80 font-medium">Relationship</td>
                                    <td className="p-4 text-[#f8f8f2]/60">Partner/delegate work</td>
                                    <td className="p-4 text-[#f8f8f2]/60">Use specific capabilities</td>
                                </tr>
                                <tr className="border-b border-[#44475a]">
                                    <td className="p-4 text-[#f8f8f2]/80 font-medium">Integration</td>
                                    <td className="p-4 text-[#f8f8f2]/60 text-[#50fa7b]">✓ Can use MCP internally</td>
                                    <td className="p-4 text-[#f8f8f2]/60 text-[#bd93f9]">✓ Complements A2A</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 bg-[#bd93f9]/10 border border-[#bd93f9]/20 rounded-lg p-4">
                        <p className="text-[#bd93f9] text-sm">
                            <strong>Working Together:</strong> An A2A client agent might request an A2A server agent to perform a complex task.
                            The server agent, in turn, might use MCP to interact with tools, APIs, or data sources necessary to fulfill the A2A task.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
