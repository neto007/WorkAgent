# Evo AI - AI Agents Platform

Evo AI is an open-source platform for creating and managing AI agents, enabling integration with different AI models and services.

## 🚀 Overview

The Evo AI platform allows:

- Creation and management of AI agents
- Integration with different language models
- Client management and MCP server configuration
- Custom tools management
- **[Google Agent Development Kit (ADK)](https://google.github.io/adk-docs/)**: Base framework for agent development
- **[CrewAI Support](https://github.com/crewAI/crewAI)**: Alternative framework for agent development (in development)
- JWT authentication with email verification
- **[Agent 2 Agent (A2A) Protocol Support](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)**: Interoperability between AI agents
- **[Workflow Agent with LangGraph](https://www.langchain.com/langgraph)**: Building complex agent workflows
- **Secure API Key Management**: Encrypted storage of API keys
- **Agent Organization**: Folder structure for organizing agents by categories

## 🤖 Agent Types

Evo AI supports different types of agents that can be flexibly combined:

### 1. LLM Agent (Language Model)

Agent based on language models like GPT-4, Claude, etc. Can be configured with tools, MCP servers, and sub-agents.

### 2. A2A Agent (Agent-to-Agent)

Agent that implements Google's A2A protocol for agent interoperability.

### 3. Sequential Agent

Executes a sequence of sub-agents in a specific order.

## 📋 Requirements

- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

## 🚀 Quick Start

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/neto007/evo-ai-system.git
cd evo-ai-system
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the backend:
```bash
uvicorn src.main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 📚 Documentation

For detailed documentation, visit [doc.evolution-api.com](https://doc.evolution-api.com)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
