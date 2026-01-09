import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface CodeBlockProps {
    text: string;
    language: string;
    showLineNumbers?: boolean;
}

export function CodeBlock({ text, language, showLineNumbers = true }: CodeBlockProps) {
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        toast("Copied!", {
            description: "Code copied to clipboard",
        });
    };

    return (
        <div className="relative rounded-md overflow-hidden bg-[#282a36] border border-[#bd93f9]/20">
            <SyntaxHighlighter
                language={language}
                style={dracula}
                showLineNumbers={showLineNumbers}
                wrapLines={true}
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    borderRadius: "0.375rem",
                    background: "transparent",
                }}
            >
                {text}
            </SyntaxHighlighter>
            <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 text-white hover:bg-[#bd93f9]/20 hover:text-[#bd93f9] opacity-80 hover:opacity-100 transition-colors"
                onClick={copyToClipboard}
            >
                <ClipboardCopy className="h-4 w-4" />
            </Button>
        </div>
    );
}
