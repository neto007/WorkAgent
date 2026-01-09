import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    FileText,
    Zap,
    Settings,
    Users,
    Play
} from "lucide-react";

interface QuickStartTemplate {
    id: string;
    name: string;
    description: string;
    icon: any;
    method: string;
    message: string;
    useCase: string;
}

interface QuickStartTemplatesProps {
    onSelectTemplate: (template: QuickStartTemplate) => void;
}

export function QuickStartTemplates({ onSelectTemplate }: QuickStartTemplatesProps) {
    const templates: QuickStartTemplate[] = [
        {
            id: "hello",
            name: "Hello Agent",
            description: "Simple greeting to test agent connectivity",
            icon: MessageSquare,
            method: "message/send",
            message: "Hello! Can you introduce yourself and tell me what you can do?",
            useCase: "Basic connectivity test"
        },
        {
            id: "analysis",
            name: "Data Analysis",
            description: "Request data analysis and insights",
            icon: FileText,
            method: "message/send",
            message: "Please analyze the current market trends in AI technology and provide key insights with recommendations.",
            useCase: "Complex analytical tasks"
        },
        {
            id: "streaming",
            name: "Long Content",
            description: "Generate lengthy content with streaming",
            icon: Zap,
            method: "message/stream",
            message: "Write a comprehensive guide about implementing the Agent2Agent protocol, including technical details, best practices, and code examples.",
            useCase: "Streaming responses"
        },
        {
            id: "task-query",
            name: "Task Status",
            description: "Query the status of a running task",
            icon: Settings,
            method: "tasks/get",
            message: "",
            useCase: "Task management"
        },
        {
            id: "capabilities",
            name: "Agent Capabilities",
            description: "Discover agent capabilities and skills",
            icon: Users,
            method: "agent/authenticatedExtendedCard",
            message: "",
            useCase: "Agent discovery"
        }
    ];

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'message/send': return 'bg-[#50fa7b]/20 text-[#50fa7b] border-[#50fa7b]/30';
            case 'message/stream': return 'bg-[#bd93f9]/20 text-[#bd93f9] border-[#bd93f9]/30';
            case 'tasks/get': return 'bg-[#ff79c6]/20 text-[#ff79c6] border-[#ff79c6]/30'; // Pink
            case 'tasks/cancel': return 'bg-[#ff5555]/20 text-[#ff5555] border-[#ff5555]/30'; // Red
            case 'agent/authenticatedExtendedCard': return 'bg-[#ffb86c]/20 text-[#ffb86c] border-[#ffb86c]/30'; // Orange
            default: return 'bg-[#6272a4]/20 text-[#6272a4] border-[#6272a4]/30';
        }
    };

    return (
        <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)] mb-6">
            <CardHeader>
                <CardTitle className="text-[#bd93f9] flex items-center">
                    <Play className="h-5 w-5 mr-2" />
                    Quick Start Templates
                </CardTitle>
                <p className="text-[#f8f8f2]/60 text-sm">
                    Choose a template to quickly test different A2A protocol methods
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => {
                        const IconComponent = template.icon;
                        return (
                            <div
                                key={template.id}
                                className="bg-[#44475a]/30 border border-[#44475a] rounded-lg p-4 hover:border-[#50fa7b]/50 transition-colors cursor-pointer group"
                                onClick={() => onSelectTemplate(template)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-[#50fa7b]/20 p-2 rounded-lg">
                                            <IconComponent className="h-4 w-4 text-[#50fa7b]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[#f8f8f2] text-sm">{template.name}</h3>
                                            <p className="text-xs text-[#f8f8f2]/60">{template.useCase}</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-[#f8f8f2]/80 mb-3 line-clamp-2">
                                    {template.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <Badge className={`text-xs ${getMethodColor(template.method)}`}>
                                        {template.method}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-[#50fa7b] hover:text-[#50fa7b] hover:bg-[#50fa7b]/10 text-xs px-2 py-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Use Template
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 p-3 bg-[#bd93f9]/10 border border-[#bd93f9]/20 rounded-lg">
                    <p className="text-[#bd93f9] text-xs">
                        💡 <strong>Tip:</strong> These templates automatically configure the correct A2A method and provide example messages.
                        Simply select one and customize the agent URL and authentication.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
