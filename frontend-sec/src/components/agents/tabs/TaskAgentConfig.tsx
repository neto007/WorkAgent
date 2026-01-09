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
    Maximize2,
    Save,
    X,
    ArrowDown,
    List,
    Search,
    Edit,
} from "lucide-react";
import { useState, useEffect } from "react";
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
    errors?: Record<string, string>;
}

const getAgentTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
        llm: "LLM",
        a2a: "A2A",
        sequential: "Sequential",
        parallel: "Parallel",
        loop: "Loop",
        workflow: "Workflow",
        task: "Task",
    };
    return typeMap[type] || type;
};

const getAgentTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
        llm: "bg-[#8be9fd] text-[#282a36]",
        a2a: "bg-[#bd93f9] text-[#282a36]",
        sequential: "bg-[#ffb86c] text-[#282a36]",
        parallel: "bg-[#50fa7b] text-[#282a36]",
        loop: "bg-[#ff79c6] text-[#282a36]",
        workflow: "bg-[#f1fa8c] text-[#282a36]",
        task: "bg-[#50fa7b] text-[#282a36]",
    };
    return colorMap[type] || "bg-[#6272a4] text-white";
};

export function TaskAgentConfig({
    values,
    onChange,
    agents,
    getAgentNameById,
    singleTask = false,
    errors = {},
}: TaskAgentConfigProps) {
    const [newTask, setNewTask] = useState<TaskConfig>({
        agent_id: "",
        description: "",
        expected_output: "",
        enabled_tools: [],
    });

    const [taskAgentSearchQuery, setTaskAgentSearchQuery] = useState<string>("");
    const [filteredTaskAgents, setFilteredTaskAgents] = useState<Agent[]>([]);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [expandedDescription, setExpandedDescription] = useState("");
    const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const getAvailableTaskAgents = (currentTaskAgentId?: string) =>
        agents.filter(
            (agent) =>
                agent.id !== values.id &&
                (!values.config?.tasks?.some((task) => task.agent_id === agent.id) ||
                    agent.id === currentTaskAgentId)
        );

    useEffect(() => {
        const currentTaskAgentId =
            isEditing && editingTaskIndex !== null && values.config?.tasks
                ? values.config.tasks[editingTaskIndex].agent_id
                : undefined;

        const availableAgents = getAvailableTaskAgents(currentTaskAgentId);

        if (taskAgentSearchQuery.trim() === "") {
            setFilteredTaskAgents(availableAgents);
        } else {
            const query = taskAgentSearchQuery.toLowerCase();
            setFilteredTaskAgents(
                availableAgents.filter(
                    (agent) =>
                        agent.name.toLowerCase().includes(query) ||
                        (agent.description?.toLowerCase() || "").includes(query)
                )
            );
        }
    }, [
        taskAgentSearchQuery,
        agents,
        values.config?.tasks,
        isEditing,
        editingTaskIndex,
    ]);

    useEffect(() => {
        if (!isEditing) {
            const currentTaskAgentId =
                editingTaskIndex !== null && values.config?.tasks
                    ? values.config.tasks[editingTaskIndex]?.agent_id
                    : undefined;
            setFilteredTaskAgents(getAvailableTaskAgents(currentTaskAgentId));
        }
    }, [agents, values.config?.tasks]);

    const handleAddTask = () => {
        if (!newTask.agent_id || !newTask.description) {
            return;
        }

        if (isEditing && editingTaskIndex !== null) {
            const tasks = [...(values.config?.tasks || [])];
            tasks[editingTaskIndex] = { ...newTask };

            onChange({
                ...values,
                config: {
                    ...(values.config || {}),
                    tasks,
                },
            });

            setIsEditing(false);
            setEditingTaskIndex(null);
        } else {
            const tasks = [...(values.config?.tasks || [])];

            if (singleTask) {
                tasks.splice(0, tasks.length, newTask);
            } else {
                tasks.push(newTask);
            }

            onChange({
                ...values,
                config: {
                    ...(values.config || {}),
                    tasks,
                },
            });
        }

        setNewTask({
            agent_id: "",
            description: "",
            expected_output: "",
            enabled_tools: [],
        });
    };

    const handleEditTask = (index: number) => {
        const task = values.config?.tasks?.[index];
        if (task) {
            setNewTask({ ...task });
            setIsEditing(true);
            setEditingTaskIndex(index);
        }
    };

    const handleCancelEdit = () => {
        setNewTask({
            agent_id: "",
            description: "",
            expected_output: "",
            enabled_tools: [],
        });
        setIsEditing(false);
        setEditingTaskIndex(null);
    };

    const handleRemoveTask = (index: number) => {
        if (editingTaskIndex === index) {
            handleCancelEdit();
        }

        const tasks = [...(values.config?.tasks || [])];
        tasks.splice(index, 1);

        onChange({
            ...values,
            config: {
                ...(values.config || {}),
                tasks,
            },
        });
    };

    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const newValue = e.target.value;
        setNewTask({
            ...newTask,
            description: newValue,
        });
    };

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

    const renderAgentTypeBadge = (agentId: string) => {
        const agent = agents.find((a) => a.id === agentId);
        if (!agent) {
            return null;
        }

        return (
            <Badge className={`ml-2 ${getAgentTypeColor(agent.type)} text-xs font-black`}>
                {getAgentTypeLabel(agent.type)}
            </Badge>
        );
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white flex items-center uppercase tracking-wider">
                        <List className="mr-2 h-5 w-5 text-[#50fa7b]" />
                        {singleTask ? "Task" : "Tasks"}
                    </h3>
                </div>

                <div className="border-2 border-[#1a1b26] rounded-lg p-4 bg-[#0b0b11]">
                    <p className="text-sm text-[#6272a4] mb-4">
                        {singleTask
                            ? "Configure the task that will be executed by the agent."
                            : "Configure the sequential tasks that will be executed by the team of agents."}
                    </p>

                    {errors.tasks && (
                        <div className="mb-4 p-3 border-2 border-[#ff5555] rounded-lg bg-[#ff5555]/10">
                            <p className="text-[#ff5555] font-bold uppercase text-sm">⚠️ {errors.tasks}</p>
                        </div>
                    )}

                    {values.config?.tasks && values.config.tasks.length > 0 ? (
                        <div className="space-y-4 mb-4">
                            {values.config.tasks.map((task, index) => (
                                <div
                                    key={index}
                                    className={`border-2 border-[#1a1b26] rounded-lg p-3 ${editingTaskIndex === index ? "bg-[#bd93f9]/10 border-[#bd93f9]" : "bg-[#0b0b11]"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <span className="inline-flex items-center justify-center rounded-full bg-[#bd93f9] px-2 py-1 text-xs text-[#282a36] font-black mr-2">
                                                    {index + 1}
                                                </span>
                                                <h4 className="font-black text-white flex items-center uppercase tracking-wide">
                                                    {getAgentNameById(task.agent_id)}
                                                    {renderAgentTypeBadge(task.agent_id)}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-[#f8f8f2] mt-1">
                                                {task.description}
                                            </p>
                                            {task.expected_output && (
                                                <div className="mt-2">
                                                    <span className="text-xs text-[#6272a4]">
                                                        Expected output:
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-2 bg-[#1a1b26] text-[#50fa7b] border-[#50fa7b]/30"
                                                    >
                                                        {task.expected_output}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditTask(index)}
                                                className="text-[#6272a4] hover:text-[#bd93f9] hover:bg-[#1a1b26] mr-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveTask(index)}
                                                className="text-[#ff5555] hover:text-[#ff5555] hover:bg-[#1a1b26]"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {!singleTask &&
                                        index < (values.config?.tasks?.length || 0) - 1 && (
                                            <div className="flex justify-center my-2">
                                                <ArrowDown className="h-4 w-4 text-[#6272a4]" />
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 mb-4 bg-[#1a1b26] rounded-md border-2 border-dashed border-[#6272a4]">
                            <p className="text-[#6272a4] font-bold">No tasks configured</p>
                            <p className="text-xs text-[#6272a4]">
                                {singleTask
                                    ? "Add a task to define the agent's behavior"
                                    : "Add tasks to define the workflow of the team"}
                            </p>
                        </div>
                    )}

                    {(!singleTask ||
                        !values.config?.tasks ||
                        values.config.tasks.length === 0 ||
                        isEditing) && (
                            <div className="space-y-3 border-t-2 border-[#1a1b26] pt-4">
                                <h4 className="text-sm font-black text-white flex items-center justify-between uppercase tracking-wider">
                                    <span>
                                        {isEditing
                                            ? "Edit task"
                                            : `Add ${singleTask ? "one" : "new"} task`}
                                    </span>
                                    {isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                            className="text-[#6272a4] hover:text-[#50fa7b] hover:bg-[#1a1b26]"
                                        >
                                            <X className="h-4 w-4 mr-1" /> Cancel
                                        </Button>
                                    )}
                                </h4>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <Label
                                            htmlFor="agent_id"
                                            className="text-xs text-[#6272a4] mb-1 block font-bold uppercase"
                                        >
                                            Agent
                                        </Label>
                                        <Select
                                            value={newTask.agent_id}
                                            onValueChange={(value) =>
                                                setNewTask({ ...newTask, agent_id: value })
                                            }
                                        >
                                            <SelectTrigger className="bg-[#1a1b26] border-[#6272a4] text-white">
                                                <SelectValue placeholder="Select agent" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1b26] border-[#6272a4] text-white p-0">
                                                <div className="sticky top-0 z-10 p-2 bg-[#1a1b26] border-b border-[#6272a4]">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6272a4]" />
                                                        <Input
                                                            placeholder="Search agents..."
                                                            className="bg-[#0b0b11] border-[#6272a4] text-white h-8 pl-8"
                                                            value={taskAgentSearchQuery}
                                                            onChange={(e) =>
                                                                setTaskAgentSearchQuery(e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="max-h-[200px] overflow-y-auto py-1">
                                                    {filteredTaskAgents.length > 0 ? (
                                                        filteredTaskAgents.map((agent) => (
                                                            <SelectItem
                                                                key={agent.id}
                                                                value={agent.id}
                                                                className="hover:bg-[#6272a4] focus:bg-[#6272a4] flex items-center justify-between px-2"
                                                            >
                                                                <div className="flex items-center">
                                                                    <span className="mr-2">{agent.name}</span>
                                                                    <Badge
                                                                        className={`${getAgentTypeColor(
                                                                            agent.type
                                                                        )} text-xs font-black`}
                                                                    >
                                                                        {getAgentTypeLabel(agent.type)}
                                                                    </Badge>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="text-[#6272a4] px-4 py-2 text-center">
                                                            No agents found
                                                        </div>
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-2">
                                        <Label
                                            htmlFor="description"
                                            className="text-xs text-[#6272a4] mb-1 block font-bold uppercase"
                                        >
                                            Task description
                                        </Label>
                                        <div className="relative">
                                            <Textarea
                                                id="description"
                                                value={newTask.description}
                                                onChange={handleDescriptionChange}
                                                className="w-full bg-[#1a1b26] border-[#6272a4] text-white pr-10"
                                                rows={3}
                                                onClick={handleExpandDescription}
                                            />
                                            <button
                                                type="button"
                                                className="absolute top-3 right-5 text-[#6272a4] hover:text-[#bd93f9] focus:outline-none"
                                                onClick={handleExpandDescription}
                                            >
                                                <Maximize2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="mt-1 text-xs text-[#6272a4]">
                                            <span>
                                                Use {"{"}content{"}"} to insert the user's input.
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        htmlFor="expected_output"
                                        className="text-xs text-[#6272a4] mb-1 block font-bold uppercase"
                                    >
                                        Expected output (optional)
                                    </Label>
                                    <Input
                                        id="expected_output"
                                        placeholder="Ex: JSON report, List of recommendations, etc."
                                        value={newTask.expected_output}
                                        onChange={(e) =>
                                            setNewTask({ ...newTask, expected_output: e.target.value })
                                        }
                                        className="bg-[#1a1b26] border-[#6272a4] text-white"
                                    />
                                </div>

                                <div className="flex items-center justify-end mt-3">
                                    <Button
                                        onClick={handleAddTask}
                                        disabled={!newTask.agent_id || !newTask.description}
                                        className="bg-[#50fa7b] text-[#282a36] border-2 border-[#2aa34a] hover:bg-[#50fa7b]/90 font-black uppercase"
                                    >
                                        <Save className="h-4 w-4 mr-1" />{" "}
                                        {isEditing ? "Update task" : "Add task"}
                                    </Button>
                                </div>
                            </div>
                        )}
                </div>
            </div>

            <Dialog
                open={isDescriptionModalOpen}
                onOpenChange={setIsDescriptionModalOpen}
            >
                <DialogContent className="sm:max-w-[1200px] max-h-[90vh] bg-[#0b0b11] border-[#1a1b26] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-white font-black uppercase tracking-wider">Task Description</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col min-h-[60vh]">
                        <Textarea
                            value={expandedDescription}
                            onChange={(e) => setExpandedDescription(e.target.value)}
                            className="flex-1 min-h-full bg-[#1a1b26] border-[#6272a4] text-white p-4 focus:border-[#bd93f9] focus:ring-[#bd93f9] focus:ring-opacity-50 resize-none"
                            placeholder="Enter detailed description for the task..."
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDescriptionModalOpen(false)}
                            className="bg-[#1a1b26] border-[#6272a4] text-[#6272a4] hover:bg-[#6272a4] hover:text-white font-black uppercase"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveExpandedDescription}
                            className="bg-[#50fa7b] text-[#282a36] hover:bg-[#2aa34a] font-black uppercase"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save description
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
