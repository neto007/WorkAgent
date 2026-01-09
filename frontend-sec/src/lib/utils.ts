import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Sanitizes the agent name by removing accents,
 * replacing spaces with underscores and removing special characters
 */
export function sanitizeAgentName(name: string): string {
    // Remove accents (normalize to basic form without combined characters)
    const withoutAccents = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Replace spaces with underscores and remove special characters
    return withoutAccents
        .replace(/\s+/g, "_") // Spaces to underscores
        .replace(/[^a-zA-Z0-9_]/g, ""); // Remove everything that is not alphanumeric or underscore
}

/**
 * Escapes braces in instruction prompts to avoid interpretation errors
 * as context variables in Python. Uses a more robust approach to ensure
 * Python doesn't interpret any brace patterns as variables.
 */
export function escapePromptBraces(text: string): string {
    if (!text) return text;

    // replace { per [ and } per ]
    return text.replace(/\{/g, "[").replace(/\}/g, "]");
}

export function exportAsJson(
    data: any,
    filename: string,
    pretty: boolean = true,
    allAgents?: any[]
): boolean {
    try {
        // Create a copy of the data
        let exportData = JSON.parse(JSON.stringify(data));

        // If we have all agents available, use them to resolve references
        const agentsMap = new Map();
        if (allAgents && Array.isArray(allAgents)) {
            allAgents.forEach(agent => {
                if (agent && agent.id) {
                    agentsMap.set(agent.id, { ...agent });
                }
            });
        } else if (exportData.agents && Array.isArray(exportData.agents)) {
            // If we're exporting a collection, build a map from that
            exportData.agents.forEach((agent: any) => {
                if (agent && agent.id) {
                    agentsMap.set(agent.id, { ...agent });
                }
            });
        }

        // Process each agent to replace IDs with full objects and remove sensitive fields
        const processAgent = (agent: any, depth = 0) => {
            if (!agent || depth > 2) return agent; // Limit recursion depth to avoid circular references

            // Process agent_tools - replace IDs with full agent objects
            if (agent.config && agent.config.agent_tools && Array.isArray(agent.config.agent_tools)) {
                agent.config.agent_tools = agent.config.agent_tools.map((toolId: string) => {
                    if (typeof toolId === 'string' && agentsMap.has(toolId)) {
                        // Create a simplified version of the agent
                        const toolAgent = { ...agentsMap.get(toolId) };
                        return processAgent(toolAgent, depth + 1);
                    }
                    return toolId;
                });
            }

            // Process sub_agents - replace IDs with full agent objects
            if (agent.config && agent.config.sub_agents && Array.isArray(agent.config.sub_agents)) {
                agent.config.sub_agents = agent.config.sub_agents.map((agentId: string) => {
                    if (typeof agentId === 'string' && agentsMap.has(agentId)) {
                        // Create a simplified version of the agent
                        const subAgent = { ...agentsMap.get(agentId) };
                        return processAgent(subAgent, depth + 1);
                    }
                    return agentId;
                });
            }

            // Process task agents - extract tasks and create full agent objects
            if (agent.type === 'task' && agent.config?.tasks && Array.isArray(agent.config.tasks)) {
                agent.config.tasks = agent.config.tasks.map((task: any) => {
                    if (task.agent_id && agentsMap.has(task.agent_id)) {
                        // Add the corresponding agent to the task
                        task.agent = processAgent({ ...agentsMap.get(task.agent_id) }, depth + 1);
                    }
                    return task;
                });
            }

            // Process workflow nodes - recursively process any agent objects in agent-nodes
            if (agent.type === 'workflow' && agent.config?.workflow?.nodes && Array.isArray(agent.config.workflow.nodes)) {
                agent.config.workflow.nodes = agent.config.workflow.nodes.map((node: any) => {
                    if (node.type === 'agent-node' && node.data?.agent) {
                        // Process the embedded agent object
                        node.data.agent = processAgent(node.data.agent, depth + 1);

                        // If this is a task agent, also process its tasks
                        if (node.data.agent.type === 'task' && node.data.agent.config?.tasks && Array.isArray(node.data.agent.config.tasks)) {
                            node.data.agent.config.tasks = node.data.agent.config.tasks.map((task: any) => {
                                if (task.agent_id && agentsMap.has(task.agent_id)) {
                                    task.agent = processAgent({ ...agentsMap.get(task.agent_id) }, depth + 1);
                                }
                                return task;
                            });
                        }
                    }
                    return node;
                });
            }

            // Remove sensitive fields
            const fieldsToRemove = [
                'api_key_id',
                'agent_card_url',
                'folder_id',
                'client_id',
                'created_at',
                'updated_at'
            ];

            // Remove top-level fields
            fieldsToRemove.forEach(field => {
                if (agent[field] !== undefined) {
                    delete agent[field];
                }
            });

            // Remove nested fields
            if (agent.config && agent.config.api_key !== undefined) {
                delete agent.config.api_key;
            }

            return agent;
        };

        // Apply processing for single agent or array of agents
        if (exportData.agents && Array.isArray(exportData.agents)) {
            // For collections of agents
            exportData.agents = exportData.agents.map((agent: any) => processAgent(agent));
        } else if (exportData.id && (exportData.type || exportData.name)) {
            // For a single agent
            exportData = processAgent(exportData);
        }

        // Create JSON string
        const jsonString = pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);

        // Create a Blob with the content
        const blob = new Blob([jsonString], { type: "application/json" });

        // Create URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a temporary <a> element for download
        const link = document.createElement("a");
        link.href = url;
        link.download = filename.endsWith(".json") ? filename : `${filename}.json`;

        // Append to document, click, and remove
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        return true;
    } catch (error) {
        console.error("Error exporting JSON:", error);
        return false;
    }
}
