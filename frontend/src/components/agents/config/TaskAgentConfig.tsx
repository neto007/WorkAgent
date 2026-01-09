import type { Agent, TaskConfig } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Save,
    X,
    ArrowDown,
    Plus,
    Edit,
    Settings,
    Search,
    PenTool,
    Maximize2,
    Check,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface TaskAgentConfigProps {
    values: Partial<Agent>;
    onChange: (values: Partial<Agent>) => void;
    agents: Agent[];
    getAgentNameById: (id: string) => string;
    singleTask?: boolean;
}

export function TaskAgentConfig({
    values,
    onChange,
    agents,
    getAgentNameById,
    singleTask = false,
}: TaskAgentConfigProps) {
    const [newTask, setNewTask] = useState<TaskConfig>({
        agent_id: "",
        description: "",
        expected_output: "",
        enabled_tools: [],
    });

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Search & Filter State
    const [taskAgentSearchQuery, setTaskAgentSearchQuery] = useState<string>("");

    // Description Modal State
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [expandedDescription, setExpandedDescription] = useState("");

    // Tools State
    const [toolSearchQuery, setToolSearchQuery] = useState<string>("");
    const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
    const [tempSelectedTools, setTempSelectedTools] = useState<string[]>([]);

    // Effects
    useEffect(() => {
        if (isToolsModalOpen) {
            if (editingIndex !== null && values.config?.tasks) {
                setTempSelectedTools(values.config.tasks[editingIndex]?.enabled_tools || []);
            } else {
                setTempSelectedTools([...newTask.enabled_tools || []]);
            }
        }
    }, [isToolsModalOpen]);

    const filteredTaskAgents = useMemo(() => {
        const currentTaskAgentId =
            editingIndex !== null && values.config?.tasks
                ? values.config.tasks[editingIndex].agent_id
                : undefined;

        const availableAgents = agents.filter(
            (agent) =>
                agent.id !== values.id &&
                (!values.config?.tasks?.some((task) => task.agent_id === agent.id) ||
                    agent.id === currentTaskAgentId)
        );

        if (taskAgentSearchQuery.trim() === "") {
            return availableAgents;
        } else {
            const query = taskAgentSearchQuery.toLowerCase();
            return availableAgents.filter(
                (agent) =>
                    agent.name.toLowerCase().includes(query) ||
                    (agent.description?.toLowerCase() || "").includes(query)
            );
        }
    }, [agents, values.id, values.config?.tasks, editingIndex, taskAgentSearchQuery]);

    const filteredTools = useMemo(() => {
        const extractToolsFromAgent = (agent?: Agent) => {
            const toolsList: { id: string, name: string }[] = [];
            const toolsMap: Record<string, boolean> = {};

            if (agent?.type === "llm" && agent.config?.tools) {
                agent.config.tools.forEach(tool => {
                    if (!toolsMap[tool.id]) {
                        toolsList.push({ id: tool.id, name: tool.id });
                        toolsMap[tool.id] = true;
                    }
                });
            }

            if (agent?.type === "llm" && agent.config?.mcp_servers) {
                agent.config.mcp_servers.forEach(mcp => {
                    if (mcp.tools) {
                        mcp.tools.forEach(toolId => {
                            if (!toolsMap[toolId]) {
                                toolsList.push({ id: toolId, name: toolId });
                                toolsMap[toolId] = true;
                            }
                        });
                    }
                });
            }
            return toolsList;
        }

        const getAvailableTools = () => {
            if (!values.config?.tasks || values.config.tasks.length === 0) {
                // For new task, we check the selected agent
                if (newTask.agent_id) {
                    const agent = agents.find(a => a.id === newTask.agent_id);
                    return extractToolsFromAgent(agent);
                }
                return [];
            }

            // If editing, get tools for the assigned agent
            const agentId = editingIndex !== null ? values.config.tasks[editingIndex].agent_id : newTask.agent_id;
            if (!agentId) return [];

            const agent = agents.find(a => a.id === agentId);
            return extractToolsFromAgent(agent);
        };

        const availableTools = getAvailableTools();

        if (toolSearchQuery.trim() === "") {
            return availableTools;
        } else {
            const query = toolSearchQuery.toLowerCase();
            return availableTools.filter(
                (tool) =>
                    tool.name.toLowerCase().includes(query) ||
                    tool.id.toLowerCase().includes(query)
            );
        }
    }, [toolSearchQuery, newTask.agent_id, editingIndex, agents, values.config?.tasks]);

    // Handlers
    const handleExpandDescription = () => {
        setExpandedDescription(newTask.description);
        setIsDescriptionModalOpen(true);
    };

    const handleSaveExpandedDescription = () => {
        setNewTask({
            ...newTask,
            description: expandedDescription,
        });
        setIsDescriptionModalOpen(false);
    };

    const handleToggleTool = (toolId: string) => {
        const index = tempSelectedTools.indexOf(toolId);
        if (index > -1) {
            setTempSelectedTools(tempSelectedTools.filter(id => id !== toolId));
        } else {
            setTempSelectedTools([...tempSelectedTools, toolId]);
        }
    };

    const handleSaveTools = () => {
        setNewTask({
            ...newTask,
            enabled_tools: [...tempSelectedTools]
        });
        setIsToolsModalOpen(false);
    };

    const handleEditTask = (index: number) => {
        const task = values.config?.tasks?.[index];
        if (task) {
            setNewTask({ ...task });
            setEditingIndex(index);
        }
    };

    const handleSaveTask = () => {
        if (!newTask.agent_id || !newTask.description.trim()) return;

        const tasks = [...(values.config?.tasks || [])];
        if (editingIndex !== null) {
            tasks[editingIndex] = newTask;
        } else {
            if (singleTask) {
                tasks[0] = newTask;
            } else {
                tasks.push(newTask);
            }
        }

        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                tasks: tasks,
            },
        });

        setNewTask({
            agent_id: "",
            description: "",
            expected_output: "",
            enabled_tools: [],
        });
        setEditingIndex(null);
    };

    const handleRemoveTask = (index: number) => {
        const tasks = [...(values.config?.tasks || [])];
        tasks.splice(index, 1);
        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                tasks: tasks,
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="border-2 border-[#6272a4] rounded-xl p-6 bg-[#0b0b11] shadow-neu">
                <div className="mb-6">
                    <h3 className="text-[12px] font-black text-[#6272a4] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-[#bd93f9]" />
                        TASK Agent Configuration
                    </h3>
                    <p className="text-xs text-[#6272a4]">
                        Configuration for task agents will be available soon. Configure sub-agents in the "Sub-Agents" tab.
                    </p>
                </div>

                {/* Task List */}
                <div className="space-y-4 mb-8">
                    {values.config?.tasks && values.config.tasks.length > 0 ? (
                        values.config.tasks.map((task, index) => (
                            <div key={index} className="space-y-2">
                                <div className="p-4 bg-[#1a1b26] border-2 border-black rounded-xl relative group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-[#50fa7b] text-black border-2 border-black h-6 font-black shadow-sm">
                                                #{index + 1}
                                            </Badge>
                                            <span className="font-bold text-white text-sm">
                                                {getAgentNameById(task.agent_id)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-[#8be9fd]"
                                                onClick={() => handleEditTask(index)}
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-[#ff5555]"
                                                onClick={() => handleRemoveTask(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#f8f8f2] line-clamp-2 italic mb-2 font-medium">"{task.description}"</p>
                                    {task.expected_output && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-[#6272a4] uppercase font-bold tracking-tighter">Output:</span>
                                            <Badge variant="outline" className="text-[10px] border-[#bd93f9] text-[#bd93f9] font-bold py-0 h-4 dash-border">
                                                {task.expected_output}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                {!singleTask && index < (values.config?.tasks?.length || 0) - 1 && (
                                    <div className="flex justify-center h-6">
                                        <ArrowDown className="h-4 w-4 text-[#6272a4] animate-bounce" />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-[#6272a4] border-2 border-dashed border-[#6272a4] rounded-xl bg-[#1a1b26]/50">
                            <p className="text-sm font-black uppercase tracking-widest opacity-50">No tasks defined</p>
                        </div>
                    )}
                </div>

                {/* Add/Edit Task Form */}
                {(!singleTask || !values.config?.tasks || values.config.tasks.length === 0 || editingIndex !== null) && (
                    <div className="border-2 border-[#1a1b26] rounded-xl p-5 bg-[#050101] shadow-neu-sm">
                        <h4 className="text-xs font-black text-[#f8f8f2] uppercase tracking-widest flex items-center gap-2 mb-4">
                            {editingIndex !== null ? <Edit className="h-3 w-3 text-[#f1fa8c]" /> : <Plus className="h-3 w-3 text-[#50fa7b]" />}
                            {editingIndex !== null ? "Edit Assignment" : "New Assignment"}
                        </h4>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-[#6272a4] uppercase tracking-widest">Assign to Agent</Label>
                                <Select
                                    value={newTask.agent_id}
                                    onValueChange={(val) => setNewTask({ ...newTask, agent_id: val })}
                                >
                                    <SelectTrigger className="bg-[#0b0b11] border-2 border-[#1a1b26] text-[#f8f8f2] focus:ring-0 focus:border-[#50fa7b] focus:shadow-neu-green text-xs h-10 rounded-lg transition-all">
                                        <SelectValue placeholder="Select an agent..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0b0b11] border-2 border-[#1a1b26] text-[#f8f8f2]">
                                        <div className="p-2 border-b-2 border-[#1a1b26] bg-[#0b0b11] sticky top-0 z-10">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-[#6272a4]" />
                                                <Input
                                                    placeholder="Search agents..."
                                                    className="bg-[#1a1b26] border-none text-[#f8f8f2] h-8 pl-8 text-xs focus:ring-0 rounded-md"
                                                    value={taskAgentSearchQuery}
                                                    onChange={(e) => setTaskAgentSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto">
                                            {filteredTaskAgents.length > 0 ? (
                                                filteredTaskAgents.map((agent) => (
                                                    <SelectItem key={agent.id} value={agent.id} className="text-xs focus:bg-[#50fa7b] focus:text-black font-bold cursor-pointer my-1 rounded-md">
                                                        {agent.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="text-center py-2 text-[#6272a4] text-[10px] font-bold uppercase tracking-wider">
                                                    No agents found
                                                </div>
                                            )}
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-[#6272a4] uppercase tracking-widest">Task Description</Label>
                                <div className="relative">
                                    <Textarea
                                        className="bg-[#0b0b11] border-2 border-[#1a1b26] text-[#f8f8f2] focus:border-[#50fa7b] focus:shadow-neu-green text-xs min-h-[80px] rounded-lg transition-all pr-8"
                                        placeholder="What should this agent do?"
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 text-[#6272a4] hover:text-[#50fa7b] transition-colors"
                                        onClick={handleExpandDescription}
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-[#6272a4] uppercase tracking-widest">Expected Output</Label>
                                <Input
                                    className="bg-[#0b0b11] border-2 border-[#1a1b26] text-[#f8f8f2] focus:border-[#50fa7b] focus:shadow-neu-green text-xs h-10 rounded-lg transition-all"
                                    placeholder="Ex: JSON summary, formatted list, etc."
                                    value={newTask.expected_output}
                                    onChange={(e) => setNewTask({ ...newTask, expected_output: e.target.value })}
                                />
                            </div>

                            {/* Selected Tools Preview */}
                            {newTask.enabled_tools && newTask.enabled_tools.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#6272a4] uppercase tracking-widest">Enabled Tools</Label>
                                    <div className="flex flex-wrap gap-1">
                                        {newTask.enabled_tools.map((toolId) => (
                                            <Badge
                                                key={toolId}
                                                className="bg-[#1a1b26] text-[#8be9fd] border-2 border-[#1a1b26] text-[10px]"
                                            >
                                                {toolId}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-2 gap-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsToolsModalOpen(true)}
                                    disabled={!newTask.agent_id}
                                    className="bg-[#0b0b11] border-2 border-[#1a1b26] text-[#8be9fd] hover:bg-[#8be9fd]/10 font-black uppercase tracking-wider h-10 rounded-xl flex-1"
                                >
                                    <PenTool className="h-3 w-3 mr-2" />
                                    Configure Tools
                                </Button>

                                <Button
                                    className="bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl flex-1"
                                    onClick={handleSaveTask}
                                >
                                    <Save className="h-3 w-3 mr-2" />
                                    {editingIndex !== null ? "Update" : "Add Task"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Description Modal */}
            <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
                <DialogContent className="max-w-4xl h-[80vh] bg-[#0b0b11] border-2 border-[#1a1b26] flex flex-col p-6 shadow-neu">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-white uppercase tracking-widest">
                            Task Description Editor
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 py-4">
                        <Textarea
                            value={expandedDescription}
                            onChange={(e) => setExpandedDescription(e.target.value)}
                            className="w-full h-full bg-[#1a1b26] border-2 border-[#050101] text-[#f8f8f2] p-4 rounded-xl resize-none focus:border-[#50fa7b] focus:shadow-neu-green transition-all"
                            placeholder="Enter detailed description..."
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setIsDescriptionModalOpen(false)}
                            className="bg-transparent text-[#ff5555] font-black uppercase tracking-wider border-2 border-[#ff5555] border-b-4 hover:bg-[#ff5555]/10 active:border-b-2 active:translate-y-1 transition-all h-10 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveExpandedDescription}
                            className="bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                        >
                            Save Description
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tools Modal */}
            <Dialog open={isToolsModalOpen} onOpenChange={setIsToolsModalOpen}>
                <DialogContent className="max-w-md bg-[#0b0b11] border-2 border-[#1a1b26] shadow-neu p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-white uppercase tracking-widest">
                            Select Tools
                        </DialogTitle>
                    </DialogHeader>

                    <div className="relative my-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6272a4]" />
                        <Input
                            placeholder="Filter tools..."
                            className="bg-[#1a1b26] border-2 border-[#050101] text-[#f8f8f2] pl-10 h-10 rounded-lg focus:border-[#8be9fd] focus:shadow-neu-purple"
                            value={toolSearchQuery}
                            onChange={(e) => setToolSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredTools.length > 0 ? (
                            filteredTools.map((tool) => {
                                const isSelected = tempSelectedTools.includes(tool.id);
                                return (
                                    <div
                                        key={tool.id}
                                        onClick={() => handleToggleTool(tool.id)}
                                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                            ? "bg-[#1a1b26] border-[#50fa7b] shadow-[2px_2px_0px_0px_#50fa7b]"
                                            : "bg-[#050101] border-[#1a1b26] hover:border-[#6272a4]"
                                            }`}
                                    >
                                        <div className={`h-5 w-5 rounded border-2 flex items-center justify-center mr-3 ${isSelected ? "bg-[#50fa7b] border-[#50fa7b]" : "border-[#6272a4]"
                                            }`}>
                                            {isSelected && <Check className="h-3 w-3 text-black stroke-[4]" />}
                                        </div>
                                        <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#6272a4]"}`}>
                                            {tool.name}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-[#6272a4] border-2 border-dashed border-[#1a1b26] rounded-xl">
                                <p className="text-xs font-black uppercase tracking-widest opacity-50">No tools found</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            onClick={handleSaveTools}
                            className="w-full bg-[#50fa7b] hover:bg-[#50fa7b] text-[#050101] font-black uppercase tracking-wider border-b-4 border-[#2aa34a] hover:border-[#2aa34a] active:border-b-0 active:translate-y-1 transition-all h-10 rounded-xl"
                        >
                            Confirm Selection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
