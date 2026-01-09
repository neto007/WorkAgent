import { StartNode } from './components/start/StartNode';
import { AgentNode } from './components/agent/AgentNode';
import { ConditionNode } from './components/condition/ConditionNode';
import { MessageNode } from './components/message/MessageNode';
import { DelayNode } from './components/delay/DelayNode';

export const nodeTypes = {
    'start-node': StartNode,
    'agent-node': AgentNode,
    'condition-node': ConditionNode,
    'message-node': MessageNode,
    'delay-node': DelayNode,
};

export { StartNode, AgentNode, ConditionNode, MessageNode, DelayNode };
