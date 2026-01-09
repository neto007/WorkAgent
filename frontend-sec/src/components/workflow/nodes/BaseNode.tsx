import { Handle, Position } from "@xyflow/react";
import React from "react";
import { cn } from "@/lib/utils";
import { useDnD } from "@/contexts/DnDContext";

export function BaseNode({
    selected,
    hasTarget,
    children,
    borderColor,
    isExecuting
}: {
    selected: boolean;
    hasTarget: boolean;
    children: React.ReactNode;
    borderColor: string;
    isExecuting?: boolean;
}) {
    const { pointerEvents } = useDnD();

    // FlowSec color mapping with RGB values for CSS variables
    const colorStyles = {
        blue: {
            border: "border-[#3d5afe]/70 hover:border-[#3d5afe]",
            gradient: "bg-gradient-to-br from-[#0b0b11] to-[#050101]",
            glow: "shadow-[0_0_15px_rgba(61,90,254,0.15)]",
            selectedGlow: "shadow-[0_0_25px_rgba(61,90,254,0.3)]",
            rgb: "61, 90, 254"
        },
        orange: {
            border: "border-[#ffb86c]/70 hover:border-[#ffb86c]",
            gradient: "bg-gradient-to-br from-[#0b0b11] to-[#050101]",
            glow: "shadow-[0_0_15px_rgba(255,184,108,0.15)]",
            selectedGlow: "shadow-[0_0_25px_rgba(255,184,108,0.3)]",
            rgb: "255, 184, 108"
        },
        green: {
            border: "border-[#50fa7b]/70 hover:border-[#50fa7b]",
            gradient: "bg-gradient-to-br from-[#0b0b11] to-[#050101]",
            glow: "shadow-[0_0_15px_rgba(80,250,123,0.15)]",
            selectedGlow: "shadow-[0_0_25px_rgba(80,250,123,0.3)]",
            rgb: "80, 250, 123"
        },
        red: {
            border: "border-[#ff5555]/70 hover:border-[#ff5555]",
            gradient: "bg-gradient-to-br from-[#0b0b11] to-[#050101]",
            glow: "shadow-[0_0_15px_rgba(255,85,85,0.15)]",
            selectedGlow: "shadow-[0_0_25px_rgba(255,85,85,0.3)]",
            rgb: "255, 85, 85"
        },
        yellow: {
            border: "border-[#f1fa8c]/70 hover:border-[#f1fa8c]",
            gradient: "bg-gradient-to-br from-[#0b0b11] to-[#050101]",
            glow: "shadow-[0_0_15px_rgba(241,250,140,0.15)]",
            selectedGlow: "shadow-[0_0_25px_rgba(241,250,140,0.3)]",
            rgb: "241, 250, 140"
        },
        purple: {
            border: "border-[#bd93f9]/70 hover:border-[#bd93f9]",
            gradient: "bg-gradient-to-br from-[#0b0b11] to-[#050101]",
            glow: "shadow-[0_0_15px_rgba(189,147,249,0.15)]",
            selectedGlow: "shadow-[0_0_25px_rgba(189,147,249,0.3)]",
            rgb: "189, 147, 249"
        },
        cyan: {
            border: "border-[#8be9fd]/70 hover:border-[#8be9fd]",
            gradient: "bg-gradient-to-br from-[#0b0b11] to-[#050101]",
            glow: "shadow-[0_0_15px_rgba(139,233,253,0.15)]",
            selectedGlow: "shadow-[0_0_25px_rgba(139,233,253,0.3)]",
            rgb: "139, 233, 253"
        },
        pink: {
            border: "border-[#ff79c6]/70 hover:border-[#ff79c6]",
            gradient: "bg-gradient-to-br from-[#0b0b11] to-[#050101]",
            glow: "shadow-[0_0_15px_rgba(255,121,198,0.15)]",
            selectedGlow: "shadow-[0_0_25px_rgba(255,121,198,0.3)]",
            rgb: "255, 121, 198"
        },
    };

    // Default to blue if color not in mapping
    const colorStyle = colorStyles[borderColor as keyof typeof colorStyles] || colorStyles.blue;

    // Selected styles - use same color as node border but brighter
    const selectedStyle = {
        border: colorStyle.border, // Use node's own color
        glow: colorStyle.selectedGlow
    };

    // Executing styles - use same color as node border but brighter
    const executingStyle = {
        border: colorStyle.border, // Use node's own color
        glow: colorStyle.selectedGlow // Reuse selected glow
    };

    return (
        <>
            <div
                className={cn(
                    "relative z-0 w-[350px] rounded-2xl p-4 border-2 backdrop-blur-sm transition-all duration-300",
                    "shadow-lg hover:shadow-xl",
                    isExecuting ? executingStyle.glow : selected ? selectedStyle.glow : colorStyle.glow,
                    isExecuting ? executingStyle.border : selected ? selectedStyle.border : colorStyle.border,
                    colorStyle.gradient,
                    isExecuting && "active-execution-node"
                )}
                style={{
                    backdropFilter: "blur(12px)",
                    // @ts-ignore - CSS custom property
                    "--node-color": colorStyle.rgb,
                } as React.CSSProperties}
                data-is-executing={isExecuting ? "true" : "false"}
            >
                {hasTarget && (
                    <Handle
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            width: "100%",
                            borderRadius: "15px",
                            height: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            pointerEvents: pointerEvents === "none" ? "none" : "auto",
                        }}
                        type="target"
                        position={Position.Left}
                    />
                )}

                {children}
            </div>
        </>
    );
}
