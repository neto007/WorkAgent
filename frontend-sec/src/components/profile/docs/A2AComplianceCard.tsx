import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    CheckCircle2,
    Shield,
    FileText,
    Settings,
    Network,
    AlertCircle,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useState } from "react";

export function A2AComplianceCard() {
    const [showCoreFeatures, setShowCoreFeatures] = useState(false);
    const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

    const implementedFeatures = [
        {
            name: "JSON-RPC 2.0 Protocol",
            status: "implemented",
            icon: CheckCircle2,
            description: "Full compliance with JSON-RPC 2.0 specification"
        },
        {
            name: "message/send Method",
            status: "implemented",
            icon: CheckCircle2,
            description: "Standard HTTP messaging with proper request/response format"
        },
        {
            name: "message/stream Method",
            status: "implemented",
            icon: CheckCircle2,
            description: "Real-time streaming via Server-Sent Events (SSE)"
        },
        {
            name: "tasks/get Method",
            status: "implemented",
            icon: CheckCircle2,
            description: "Task status querying and monitoring"
        },
        {
            name: "tasks/cancel Method",
            status: "implemented",
            icon: CheckCircle2,
            description: "Task cancellation support"
        },
        {
            name: "agent/authenticatedExtendedCard",
            status: "implemented",
            icon: CheckCircle2,
            description: "Agent discovery and capability enumeration"
        },
        {
            name: "File Upload Support",
            status: "implemented",
            icon: CheckCircle2,
            description: "Base64 file encoding with proper MIME type handling"
        },
        {
            name: "UUID v4 Message IDs",
            status: "implemented",
            icon: CheckCircle2,
            description: "Standards-compliant unique message identification"
        },
        {
            name: "Authentication Methods",
            status: "implemented",
            icon: CheckCircle2,
            description: "API Key and Bearer token authentication"
        },
        {
            name: "Task State Management",
            status: "implemented",
            icon: CheckCircle2,
            description: "Complete task lifecycle: submitted → working → completed/failed"
        },
        {
            name: "Artifact Handling",
            status: "implemented",
            icon: CheckCircle2,
            description: "Complex response data with structured artifacts"
        },
        {
            name: "CORS Compliance",
            status: "implemented",
            icon: CheckCircle2,
            description: "Proper cross-origin resource sharing configuration"
        },
        {
            name: "tasks/pushNotificationConfig/set",
            status: "implemented",
            icon: CheckCircle2,
            description: "Set push notification configuration for tasks"
        },
        {
            name: "tasks/pushNotificationConfig/get",
            status: "implemented",
            icon: CheckCircle2,
            description: "Get push notification configuration for tasks"
        },
        {
            name: "tasks/resubscribe",
            status: "implemented",
            icon: CheckCircle2,
            description: "Resubscribe to task updates and notifications"
        }
    ];

    const advancedFeatures = [
        {
            name: "Push Notifications",
            status: "implemented",
            icon: CheckCircle2,
            description: "A2A pushNotificationConfig methods and webhook support"
        },
        {
            name: "Multi-turn Conversations",
            status: "implemented",
            icon: CheckCircle2,
            description: "Context preservation via contextId field as per A2A specification"
        },
        {
            name: "Enhanced Error Diagnostics",
            status: "implemented",
            icon: AlertCircle,
            description: "Comprehensive A2A error analysis and troubleshooting guidance"
        }
    ];

    const implementedCount = implementedFeatures.filter(f => f.status === 'implemented').length;
    const totalFeatures = implementedFeatures.length + advancedFeatures.length;
    const partialCount = advancedFeatures.filter(f => f.status === 'partial').length;
    const advancedImplementedCount = advancedFeatures.filter(f => f.status === 'implemented').length;
    const totalImplementedCount = implementedCount + advancedImplementedCount;
    const completionPercentage = Math.round(((totalImplementedCount + (partialCount * 0.5)) / totalFeatures) * 100);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'implemented': return 'text-[#50fa7b]'; // Green
            case 'partial': return 'text-[#f1fa8c]'; // Yellow
            case 'planned': return 'text-[#bd93f9]'; // Purple
            default: return 'text-[#6272a4]'; // Comment/Neutral
        }
    };

    const getStatusIcon = (status: string, IconComponent: any) => {
        const colorClass = getStatusColor(status);
        return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
    };

    return (
        <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)]">
            <CardHeader>
                <CardTitle className="text-[#bd93f9] flex items-center">
                    <Network className="h-5 w-5 mr-2" />
                    A2A Specification Compliance
                </CardTitle>
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-[#f8f8f2]/70">Implementation Progress</span>
                            <span className="text-[#50fa7b] font-medium">{completionPercentage}%</span>
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => {
                                const shouldExpand = !showCoreFeatures || !showAdvancedFeatures;
                                setShowCoreFeatures(shouldExpand);
                                setShowAdvancedFeatures(shouldExpand);
                            }}
                            className="text-xs text-[#f8f8f2]/60 hover:text-[#f8f8f2] transition-colors px-2 py-1 rounded border border-[#44475a] hover:border-[#6272a4]"
                        >
                            {showCoreFeatures && showAdvancedFeatures ? 'Collapse All' : 'Expand All'}
                        </button>
                        <Badge className="bg-[#50fa7b]/20 text-[#50fa7b] border-[#50fa7b]/30">
                            v0.2.0 Compatible
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-center">
                    <a
                        href="https://google.github.io/A2A/specification"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center bg-[#bd93f9]/10 hover:bg-[#bd93f9]/20 px-4 py-2 rounded-lg border border-[#bd93f9]/20 transition-colors"
                    >
                        <FileText className="h-4 w-4 mr-2 text-[#bd93f9]" />
                        <span className="text-[#bd93f9]">View Official Specification</span>
                        <ExternalLink className="h-3 w-3 ml-2 text-[#bd93f9]" />
                    </a>
                </div>

                <div>
                    <div
                        className="flex items-center justify-between cursor-pointer hover:bg-[#44475a]/30 p-2 rounded-lg transition-colors mb-4 border border-transparent hover:border-[#44475a]"
                        onClick={() => setShowCoreFeatures(!showCoreFeatures)}
                    >
                        <h3 className="text-[#f8f8f2] font-semibold flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-[#50fa7b]" />
                            Core Features
                            <span className="ml-2 text-[#50fa7b] text-sm">({implementedCount}/{implementedFeatures.length} implemented)</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-[#f8f8f2]/50">
                                {showCoreFeatures ? 'Hide details' : 'Show details'}
                            </span>
                            {showCoreFeatures ? (
                                <ChevronUp className="h-4 w-4 text-[#f8f8f2]/50 hover:text-[#f8f8f2] transition-colors" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-[#f8f8f2]/50 hover:text-[#f8f8f2] transition-colors" />
                            )}
                        </div>
                    </div>

                    {showCoreFeatures && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {implementedFeatures.map((feature, index) => (
                                <div key={index} className="flex items-start space-x-3 bg-[#44475a]/20 p-3 rounded-lg border border-[#44475a]/50">
                                    {getStatusIcon(feature.status, feature.icon)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#f8f8f2] truncate">{feature.name}</p>
                                        <p className="text-xs text-[#f8f8f2]/60">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div
                        className="flex items-center justify-between cursor-pointer hover:bg-[#44475a]/30 p-2 rounded-lg transition-colors mb-4 border border-transparent hover:border-[#44475a]"
                        onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                    >
                        <h3 className="text-[#f8f8f2] font-semibold flex items-center">
                            <Settings className="h-4 w-4 mr-2 text-[#bd93f9]" />
                            Advanced Features
                            <span className="ml-2 text-[#bd93f9] text-sm">({advancedImplementedCount}/{advancedFeatures.length} implemented)</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-[#f8f8f2]/50">
                                {showAdvancedFeatures ? 'Hide details' : 'Show details'}
                            </span>
                            {showAdvancedFeatures ? (
                                <ChevronUp className="h-4 w-4 text-[#f8f8f2]/50 hover:text-[#f8f8f2] transition-colors" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-[#f8f8f2]/50 hover:text-[#f8f8f2] transition-colors" />
                            )}
                        </div>
                    </div>

                    {showAdvancedFeatures && (
                        <div className="space-y-3">
                            {advancedFeatures.map((feature, index) => (
                                <div key={index} className="flex items-start space-x-3 bg-[#44475a]/20 p-3 rounded-lg border border-[#44475a]/50">
                                    {getStatusIcon(feature.status, feature.icon)}
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium text-[#f8f8f2]">{feature.name}</p>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${feature.status === 'implemented' ? 'border-[#50fa7b] text-[#50fa7b]' :
                                                        feature.status === 'partial' ? 'border-[#f1fa8c] text-[#f1fa8c]' :
                                                            'border-[#bd93f9] text-[#bd93f9]'
                                                    }`}
                                            >
                                                {feature.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-[#f8f8f2]/60 mt-1">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-[#50fa7b]/10 border border-[#50fa7b]/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                        <Shield className="h-4 w-4 text-[#50fa7b] mt-0.5" />
                        <div className="text-sm">
                            <p className="text-[#50fa7b] font-medium">✓ 100% A2A v0.2.0 Compliance Achieved</p>
                            <p className="text-[#50fa7b]/80 mt-1">
                                All 8 official RPC methods implemented • Complete protocol data objects • Full workflow support • Enterprise security ready
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
