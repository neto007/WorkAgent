"use client";

import {
    useState,
    useEffect,
    useRef,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from "react";

import {
    Controls,
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    type OnConnect,
    ConnectionMode,
    ConnectionLineType,
    useReactFlow,
    type ProOptions,
    applyNodeChanges,
    type NodeChange,
    type OnNodesChange,
    MiniMap,
    Panel,
    Background,
} from "@xyflow/react";
import { useDnD } from "@/contexts/DnDContext";

import { Edit, X, ChevronLeft, ChevronRight } from "lucide-react";

import "@xyflow/react/dist/style.css";
import "./canva.css";

import { getHelperLines } from "./utils";

import { NodePanel } from "./NodePanel";
import ContextMenu from "./ContextMenu";
import { edgeTypes } from "./edges";
import HelperLines from "./HelperLines";
import { nodeTypes } from "./nodes";
import { AgentForm } from "./nodes/components/agent/AgentForm";
import { ConditionForm } from "./nodes/components/condition/ConditionForm";
import type { Agent } from "@/types/agent";
import { MessageForm } from "./nodes/components/message/MessageForm";
import { DelayForm } from "./nodes/components/delay/DelayForm";
import { Button } from "@/components/ui/button";

const proOptions: ProOptions = { account: "paid-pro", hideAttribution: true };

const initialNodes: any[] = [
    {
        id: "start-node",
        type: "start-node",
        position: { x: 100, y: 100 },
        data: { label: "Start" },
    },
];

const initialEdges: any[] = [];

const NodeFormWrapper = ({
    selectedNode,
    editingLabel,
    setEditingLabel,
    handleUpdateNode,
    setSelectedNode,
    children,
}: {
    selectedNode: any;
    editingLabel: boolean;
    setEditingLabel: (value: boolean) => void;
    handleUpdateNode: (node: any) => void;
    setSelectedNode: (node: any) => void;
    children: React.ReactNode;
}) => {
    // Handle ESC key to close the panel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !editingLabel) {
                setSelectedNode(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setSelectedNode, editingLabel]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 sticky top-0 z-20 bg-[#0b0b11] shadow-md border-b-2 border-[#1a1b26]">
                <div className="p-4 text-center relative">
                    <button
                        className="absolute right-2 top-2 text-[#6272a4] hover:text-[#ff5555] p-1 rounded-full hover:bg-[#1a1b26]"
                        onClick={() => setSelectedNode(null)}
                        aria-label="Close panel"
                    >
                        <X size={18} />
                    </button>
                    {!editingLabel ? (
                        <div className="flex items-center justify-center text-xl font-black text-[#f8f8f2]">
                            <span>{selectedNode.data.label}</span>
                            {selectedNode.type !== "start-node" && (
                                <Edit
                                    size={16}
                                    className="ml-2 cursor-pointer hover:text-[#bd93f9]"
                                    onClick={() => setEditingLabel(true)}
                                />
                            )}
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={selectedNode.data.label}
                            className="w-full p-2 text-center text-xl font-black bg-[#1a1b26] text-[#f8f8f2] border-2 border-[#282a36] rounded focus:border-[#bd93f9] focus:outline-none"
                            onChange={(e) => {
                                handleUpdateNode({
                                    ...selectedNode,
                                    data: {
                                        ...selectedNode.data,
                                        label: e.target.value,
                                    },
                                });
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setEditingLabel(false);
                                }
                            }}
                            onBlur={() => setEditingLabel(false)}
                            autoFocus
                        />
                    )}
                </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
        </div>
    );
};

const Canva = forwardRef(({ agent }: { agent: Agent | null }, ref) => {
    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow();
    const { type, setPointerEvents } = useDnD();
    const [menu, setMenu] = useState<any>(null);
    const localRef = useRef<any>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [activeExecutionNodeId, setActiveExecutionNodeId] = useState<string | null>(null);

    const [editingLabel, setEditingLabel] = useState(false);
    const [nodePanelOpen, setNodePanelOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        getFlowData: () => ({
            nodes,
            edges,
        }),
        setActiveExecutionNodeId,
    }));

    // Effect to clear the active node after a timeout
    useEffect(() => {
        if (activeExecutionNodeId) {
            const timer = setTimeout(() => {
                setActiveExecutionNodeId(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [activeExecutionNodeId]);

    useEffect(() => {
        if (
            agent?.config?.workflow &&
            agent.config.workflow.nodes.length > 0 &&
            agent.config.workflow.edges.length > 0
        ) {
            setNodes((agent.config.workflow.nodes as typeof initialNodes) || initialNodes);
            const loadedEdges = (agent.config.workflow.edges as typeof initialEdges) || initialEdges;
            const patchedEdges = loadedEdges.map((edge) => ({
                ...edge,
                type: "default",
                animated: true,
                data: {
                    ...edge.data,
                    handleDeleteEdge,
                    animated: true,
                    dashed: true,
                },
            }));
            setEdges(patchedEdges);
        } else {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [agent, setNodes, setEdges]);

    // Update nodes when the active node changes to add visual class
    useEffect(() => {
        if (nodes.length > 0) {
            setNodes((nds: any) =>
                nds.map((node: any) => {
                    if (node.id === activeExecutionNodeId) {
                        return {
                            ...node,
                            className: "active-execution-node",
                            data: {
                                ...node.data,
                                isExecuting: true,
                            },
                        };
                    } else {
                        const { isExecuting, ...restData } = node.data || {};
                        return {
                            ...node,
                            className: "",
                            data: restData,
                        };
                    }
                })
            );
        }
    }, [activeExecutionNodeId, setNodes]);



    const [helperLineHorizontal, setHelperLineHorizontal] = useState<number | undefined>(undefined);
    const [helperLineVertical, setHelperLineVertical] = useState<number | undefined>(undefined);

    const handleDeleteEdge = useCallback(
        (id: any) => {
            setEdges((edges) => {
                const left = edges.filter((edge: any) => edge.id !== id);
                return left;
            });
        },
        [setEdges]
    );

    const onConnect: OnConnect = useCallback(
        (connection) => {
            setEdges((currentEdges) => {
                if (connection.source === connection.target) {
                    return currentEdges;
                }

                // Get source node color based on type
                const sourceNode = nodes.find(n => n.id === connection.source);
                let sourceColor = '#bd93f9'; // default

                if (sourceNode) {
                    if (sourceNode.type === "start-node") {
                        sourceColor = "#3d5afe";
                    } else if (sourceNode.type === "agent-node") {
                        // Get agent type from node data
                        const agent = sourceNode.data?.agent;
                        if (agent) {
                            switch (agent.type) {
                                case "llm":
                                    sourceColor = "#00ff7f";
                                    break;
                                case "a2a":
                                    sourceColor = "#bd93f9";
                                    break;
                                case "sequential":
                                    sourceColor = "#f1fa8c";
                                    break;
                                case "parallel":
                                    sourceColor = "#ff79c6";
                                    break;
                                case "loop":
                                    sourceColor = "#ffb86c";
                                    break;
                                case "workflow":
                                    sourceColor = "#8be9fd";
                                    break;
                                case "task":
                                    sourceColor = "#ff5555";
                                    break;
                                default:
                                    sourceColor = "#6272a4";
                            }
                        } else {
                            sourceColor = "#6272a4"; // no agent selected
                        }
                    } else if (sourceNode.type === "message-node") {
                        sourceColor = "#ffb86c";
                    } else if (sourceNode.type === "condition-node") {
                        sourceColor = "#bd93f9";
                    } else if (sourceNode.type === "delay-node") {
                        sourceColor = "#f1fa8c";
                    } else {
                        sourceColor = "#6272a4";
                    }
                }

                const edge = {
                    ...connection,
                    type: "default",
                    animated: true,
                    data: {
                        handleDeleteEdge,
                        animated: true,
                        dashed: true,
                        color: sourceColor, // Add source node color
                    },
                };

                return addEdge(edge, currentEdges);
            });
        },
        [setEdges, handleDeleteEdge, nodes]
    );

    const onConnectEnd = useCallback(
        (_event: any, connectionState: any) => {
            setPointerEvents("none");

            if (connectionState.fromHandle?.type === "target") {
                return;
            }

            if (!connectionState.isValid) {
                // NodePanel handles node creation through drag and drop
            }
        },
        [setPointerEvents]
    );

    const onConnectStart = useCallback(() => {
        setPointerEvents("auto");
    }, [setPointerEvents]);

    const customApplyNodeChanges = useCallback(
        (changes: NodeChange[], nodes: any): any => {
            setHelperLineHorizontal(undefined);
            setHelperLineVertical(undefined);

            if (
                changes.length === 1 &&
                changes[0].type === "position" &&
                changes[0].dragging &&
                changes[0].position
            ) {
                const helperLines = getHelperLines(changes[0], nodes);

                changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x;
                changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y;

                setHelperLineHorizontal(helperLines.horizontal);
                setHelperLineVertical(helperLines.vertical);
            }

            return applyNodeChanges(changes, nodes);
        },
        []
    );

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            setNodes((nodes) => customApplyNodeChanges(changes, nodes));
        },
        [setNodes, customApplyNodeChanges]
    );

    const getLabelFromNode = (type: string) => {
        const order = nodes.length;

        switch (type) {
            case "start-node":
                return "Start";
            case "agent-node":
                return `Agent #${order}`;
            case "condition-node":
                return `Condition #${order}`;
            case "message-node":
                return `Message #${order}`;
            case "delay-node":
                return `Delay #${order}`;
            default:
                return "Node";
        }
    };



    const handleUpdateNode = useCallback(
        (node: any) => {
            setNodes((nodes) => {
                const index = nodes.findIndex((n) => n.id === node.id);
                if (index !== -1) {
                    nodes[index] = node;
                }
                return [...nodes];
            });

            if (selectedNode && selectedNode.id === node.id) {
                setSelectedNode(node);
            }
        },
        [setNodes, selectedNode]
    );



    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: any) => {
            event.preventDefault();

            if (!type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newNode: any = {
                id: String(Date.now()),
                type,
                position,
                data: {
                    label: getLabelFromNode(type),
                },
            };

            setNodes((nodes) => [...nodes, newNode]);
        },
        [screenToFlowPosition, setNodes, type]
    );

    const onNodeContextMenu = useCallback(
        (event: any, node: any) => {
            event.preventDefault();

            if (node.id === "start-node") {
                return;
            }

            if (!localRef.current) {
                return;
            }

            const paneBounds = localRef.current.getBoundingClientRect();

            const x = event.clientX - paneBounds.left;
            const y = event.clientY - paneBounds.top;

            const menuWidth = 200;
            const menuHeight = 200;

            const left = x + menuWidth > paneBounds.width ? undefined : x;
            const top = y + menuHeight > paneBounds.height ? undefined : y;
            const right = x + menuWidth > paneBounds.width ? paneBounds.width - x : undefined;
            const bottom = y + menuHeight > paneBounds.height ? paneBounds.height - y : undefined;

            setMenu({
                id: node.id,
                left,
                top,
                right,
                bottom,
            });
        },
        [setMenu]
    );

    const onNodeClick = useCallback((event: any, node: any) => {
        event.preventDefault();

        if (node.type === "start-node") {
            return;
        }

        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setMenu(null);
        setSelectedNode(null);
        setNodePanelOpen(false);
    }, [setMenu, setSelectedNode]);

    return (
        <div className="h-full w-full bg-[#050101]">
            <div
                style={{ position: "relative", height: "100%", width: "100%" }}
                ref={localRef}
                className="overflow-hidden"
            >
                <ReactFlow
                    nodes={nodes}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    edges={edges}
                    edgeTypes={edgeTypes}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onConnectStart={onConnectStart}
                    onConnectEnd={onConnectEnd}
                    connectionMode={ConnectionMode.Strict}
                    connectionLineType={ConnectionLineType.Bezier}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onPaneClick={onPaneClick}
                    onNodeClick={onNodeClick}
                    onNodeContextMenu={onNodeContextMenu}
                    colorMode="dark"
                    minZoom={0.1}
                    maxZoom={10}
                    fitView={false}
                    defaultViewport={{
                        x: 0,
                        y: 0,
                        zoom: 1,
                    }}
                    elevateEdgesOnSelect
                    elevateNodesOnSelect
                    proOptions={proOptions}
                    connectionLineStyle={{
                        stroke: "#bd93f9",
                        strokeWidth: 2,
                        strokeDashoffset: 5,
                        strokeDasharray: 5,
                    }}
                    defaultEdgeOptions={{
                        type: "default",
                        animated: true,
                        deletable: true,
                        style: {
                            strokeWidth: 3,
                        },
                        data: {
                            handleDeleteEdge,
                            animated: true,
                            dashed: true,
                        },
                    }}
                >
                    <Background color="#1a1b26" gap={24} size={1.5} />
                    <MiniMap
                        className="bg-[#0b0b11]/80 border-2 border-[#1a1b26] rounded-lg shadow-lg"
                        nodeColor={(node) => {
                            switch (node.type) {
                                case "start-node":
                                    return "#50fa7b";
                                case "agent-node":
                                    return "#bd93f9";
                                case "message-node":
                                    return "#ffb86c";
                                case "condition-node":
                                    return "#bd93f9";
                                case "delay-node":
                                    return "#f1fa8c";
                                default:
                                    return "#6272a4";
                            }
                        }}
                        maskColor="rgba(11, 11, 17, 0.6)"
                    />

                    <Controls
                        showInteractive={true}
                        showFitView={true}
                        orientation="vertical"
                        position="bottom-left"
                    />
                    <HelperLines horizontal={helperLineHorizontal} vertical={helperLineVertical} />
                    {menu && <ContextMenu onClick={onPaneClick} {...menu} />}

                    {nodePanelOpen ? (
                        <Panel position="top-right">
                            <div className="flex items-start">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setNodePanelOpen(false)}
                                    className="mr-2 h-8 w-8 rounded-full bg-[#1a1b26] border-2 border-[#282a36] text-[#6272a4] hover:text-[#f8f8f2] hover:bg-[#282a36]"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <NodePanel />
                            </div>
                        </Panel>
                    ) : (
                        <Panel position="top-right">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setNodePanelOpen(true)}
                                className="h-8 w-8 rounded-full bg-[#1a1b26] border-2 border-[#282a36] text-[#6272a4] hover:text-[#f8f8f2] hover:bg-[#282a36]"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Panel>
                    )}
                </ReactFlow>

                {/* Overlay when form is open on smaller screens */}
                {selectedNode && (
                    <div
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[5] transition-opacity duration-300"
                        onClick={() => setSelectedNode(null)}
                    />
                )}

                <div
                    className="absolute left-0 top-0 z-10 h-full w-[350px] bg-[#0b0b11] shadow-lg transition-all duration-300 ease-in-out border-r-2 border-[#1a1b26] flex flex-col"
                    style={{
                        transform: selectedNode ? "translateX(0)" : "translateX(-100%)",
                        opacity: selectedNode ? 1 : 0,
                    }}
                >
                    {selectedNode ? (
                        <NodeFormWrapper
                            selectedNode={selectedNode}
                            editingLabel={editingLabel}
                            setEditingLabel={setEditingLabel}
                            handleUpdateNode={handleUpdateNode}
                            setSelectedNode={setSelectedNode}
                        >
                            {selectedNode.type === "agent-node" && (
                                <AgentForm
                                    selectedNode={selectedNode}
                                    handleUpdateNode={handleUpdateNode}
                                />
                            )}
                            {selectedNode.type === "condition-node" && (
                                <ConditionForm
                                    selectedNode={selectedNode}
                                    handleUpdateNode={handleUpdateNode}
                                />
                            )}
                            {selectedNode.type === "message-node" && (
                                <MessageForm
                                    selectedNode={selectedNode}
                                    handleUpdateNode={handleUpdateNode}
                                />
                            )}
                            {selectedNode.type === "delay-node" && (
                                <DelayForm
                                    selectedNode={selectedNode}
                                    handleUpdateNode={handleUpdateNode}
                                />
                            )}
                        </NodeFormWrapper>
                    ) : null}
                </div>
            </div>
        </div>
    );
});

Canva.displayName = "Canva";

export default Canva;
