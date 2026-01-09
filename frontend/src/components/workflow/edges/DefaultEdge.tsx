import { useCallback, useMemo } from "react";
import {
    EdgeLabelRenderer,
    getBezierPath,
    getSmoothStepPath,
    getStraightPath,
    useStore,
    type EdgeProps,
} from "@xyflow/react";
import { X } from "lucide-react";
import { getEdgeParams } from "../utils/floating-edge-utils";

export function DefaultEdge({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,

    data,
    selected,
}: EdgeProps) {
    const sourceNode = useStore(
        useCallback((store) => store.nodeLookup.get(source), [source])
    );
    const targetNode = useStore(
        useCallback((store) => store.nodeLookup.get(target), [target])
    );

    const { sx, sy, tx, ty, sourcePos, targetPos } = useMemo(() => {
        if (!sourceNode || !targetNode) {
            return {
                sx: sourceX,
                sy: sourceY,
                tx: targetX,
                ty: targetY,
                sourcePos: sourcePosition,
                targetPos: targetPosition,
            };
        }
        return getEdgeParams(sourceNode, targetNode);
    }, [
        sourceNode,
        targetNode,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    ]);

    // Edge configuration
    const pathType = data?.pathType || "smooth";
    const edgeColor = (data?.color as string) || "#bd93f9";
    const label = (data?.label as string) || "";
    const isDashed = data?.dashed === true;

    const [edgePath, labelX, labelY] = useMemo(() => {
        const params = {
            sourceX: sx,
            sourceY: sy,
            sourcePosition: sourcePos,
            targetX: tx,
            targetY: ty,
            targetPosition: targetPos,
        };

        switch (pathType) {
            case "bezier":
                return getBezierPath(params);
            case "smooth":
            case "catmull-rom":
                return getSmoothStepPath({ ...params, borderRadius: 20 });
            case "step":
                return getSmoothStepPath({ ...params, borderRadius: 0 });
            case "straight":
            case "linear":
                return getStraightPath(params);
            default:
                return getSmoothStepPath({ ...params, borderRadius: 20 });
        }
    }, [sx, sy, tx, ty, sourcePos, targetPos, pathType]);

    const pathStyle = {
        ...style,
        strokeDasharray: isDashed ? "5,5" : undefined,
    };

    return (
        <>
            {/* Invisible SVG for definitions */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <marker
                        id={`arrowhead-${id}`}
                        viewBox="0 0 10 10"
                        refX="5"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={edgeColor} />
                    </marker>
                </defs>
            </svg>

            {/* Selection Glow */}
            {selected && (
                <path
                    d={edgePath}
                    style={{
                        strokeWidth: 12,
                        stroke: edgeColor,
                        opacity: 0.3,
                        filter: "blur(15px)",
                    }}
                    className="react-flow__edge-path animate-pulse"
                />
            )}

            {/* Background glow path */}
            <path
                d={edgePath}
                id={id}
                style={{
                    ...pathStyle,
                    strokeWidth: 8,
                    stroke: edgeColor,
                    opacity: 0.1,
                    filter: "blur(12px)",
                }}
            />

            {/* Base core path - Always dashed and animated as per original */}
            <path
                d={edgePath}
                id={`${id}-main`}
                style={{
                    ...pathStyle,
                    strokeWidth: selected ? 3 : 2,
                    stroke: edgeColor,
                    filter: `drop-shadow(0 0 ${selected ? '12px' : '8px'} ${edgeColor})`,
                    transition: "all 0.3s ease",
                }}
                className="react-flow__edge-path edge-dashed-animated"
                markerEnd={markerEnd || `url(#arrowhead-${id})`}
            />

            {/* Edge Label */}
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: "all",
                            zIndex: 1000,
                        }}
                        className="nodrag nopan"
                    >
                        <div
                            className="px-2 py-1 rounded-sm bg-[#050101]/90 border border-current text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
                            style={{
                                color: edgeColor,
                                boxShadow: `0 0 15px ${edgeColor}44`,
                                textShadow: `0 0 8px ${edgeColor}`,
                            }}
                        >
                            {label}
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}

            {/* Delete Button matching original high Z-index */}
            {selected && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: "all",
                            zIndex: 1000,
                        }}
                        className="nodrag nopan"
                    >
                        <button
                            className="rounded-full bg-white p-1 shadow-md hover:scale-110 transition-transform"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (data?.handleDeleteEdge && typeof data.handleDeleteEdge === 'function') {
                                    data.handleDeleteEdge(id);
                                }
                            }}
                        >
                            <X className="text-red-500" size={16} />
                        </button>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
