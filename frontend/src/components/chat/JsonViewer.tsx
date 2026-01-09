import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

interface JsonViewerProps {
    data: any;
    defaultExpanded?: boolean;
}

export const JsonViewer = ({ data, defaultExpanded = false }: JsonViewerProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="my-3 relative group/json bg-[#0b0b11] border-2 border-[#bd93f9]/30 rounded-lg overflow-hidden shadow-neu-sm">
            <div className="bg-[#1a1b26] px-3 py-2 flex justify-between items-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-[#bd93f9] hover:text-[#ff79c6] transition-colors font-bold text-xs uppercase tracking-wider"
                >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span>JSON Response</span>
                </button>
                <button
                    onClick={copyToClipboard}
                    className="text-[#6272a4] hover:text-[#50fa7b] transition-colors"
                    title="Copy JSON"
                >
                    {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
            </div>

            {isExpanded && (
                <pre className="p-4 overflow-x-auto custom-scrollbar text-sm text-[#f8f8f2] font-mono bg-[#0b0b11] max-h-[500px] overflow-y-auto">
                    <code className="json-syntax-highlight">
                        {JSON.stringify(data, null, 2)}
                    </code>
                </pre>
            )}
        </div>
    );
};

export const isValidJSON = (str: string): boolean => {
    if (typeof str !== 'string') return false;

    const trimmed = str.trim();
    if (!trimmed) return false;

    // Try to unescape the string if it's escaped (e.g., from Python's json.dumps)
    let testStr = trimmed;

    // Check if the string looks like escaped JSON (contains literal backslash-n or backslash-quote)
    // In JavaScript strings, we need to check for the actual backslash character
    const hasEscapes = /\\[ntr"\\]/.test(testStr);

    if (hasEscapes) {
        try {
            // The content is wrapped in quotes and escaped, so we treat it as a JSON string
            // This removes one level of escaping
            testStr = JSON.parse(`"${testStr.replace(/"/g, '\\"')}"`);
        } catch (e) {
            // If unescaping fails, try the original
            console.log('[JsonViewer] Failed to unescape, trying original:', e);
            testStr = trimmed;
        }
    }

    // Check if it starts/ends with JSON delimiters
    if (!(
        (testStr.startsWith('{') && testStr.endsWith('}')) ||
        (testStr.startsWith('[') && testStr.endsWith(']'))
    )) {
        return false;
    }

    try {
        const parsed = JSON.parse(testStr);
        // Ensure it's an object or array, not just a JSON primitive
        return typeof parsed === 'object' && parsed !== null;
    } catch (e) {
        console.log('[JsonViewer] Failed to parse as JSON:', e);
        return false;
    }
};

// Helper to extract actual JSON from escaped string
export const parseEscapedJSON = (str: string): any => {
    let testStr = str.trim();

    // Check for escape sequences
    const hasEscapes = /\\[ntr"\\]/.test(testStr);

    if (hasEscapes) {
        try {
            // Unescape the string
            testStr = JSON.parse(`"${testStr.replace(/"/g, '\\"')}"`);
        } catch (e) {
            console.log('[JsonViewer] Failed to unescape in parseEscapedJSON:', e);
            // Use original if unescape fails
        }
    }

    return JSON.parse(testStr);
};
