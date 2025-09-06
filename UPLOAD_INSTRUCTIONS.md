# Instruções para Upload do Código para GitHub

Como o token atual não possui permissões para criar repositórios ou fazer push diretamente, siga estas instruções para fazer o upload manual do código:

## Opção 1: Criar um novo repositório no GitHub

1. **Acesse o GitHub**: Vá para https://github.com e faça login na sua conta

2. **Criar novo repositório**:
   - Clique no botão "+" no canto superior direito
   - Selecione "New repository"
   - Nome sugerido: `evo-ai-system`
   - Descrição: "Sistema de IA evolutiva com interface web e backend FastAPI - Plataforma completa para agentes inteligentes"
   - Deixe como público ou privado conforme sua preferência
   - **NÃO** inicialize com README, .gitignore ou licença (já temos esses arquivos)

3. **Configurar o remote local**:
   ```bash
   # Remover o remote atual (se necessário)
   git remote remove origin
   
   # Adicionar o novo remote (substitua SEU_USUARIO pelo seu username do GitHub)
   git remote add origin https://github.com/SEU_USUARIO/evo-ai-system.git
   
   # Fazer o push inicial
   git push -u origin main
   ```

## Opção 2: Fork do repositório original

1. **Fazer fork**:
   - Acesse: https://github.com/EvolutionAPI/evo-ai
   - Clique em "Fork" no canto superior direito
   - Selecione sua conta como destino

2. **Configurar o remote para seu fork**:
   ```bash
   # Adicionar seu fork como remote
   git remote add myfork https://github.com/SEU_USUARIO/evo-ai.git
   
   # Fazer push para seu fork
   git push myfork main
   ```

## Opção 3: Upload manual via interface web

Se preferir fazer upload manual dos arquivos:

1. Crie um novo repositório no GitHub (seguindo o passo 2 da Opção 1)
2. Use a interface web "Upload files" para fazer upload dos seguintes arquivos principais:

### Arquivos modificados recentemente:
- `frontend/app/agents/page.tsx`
- `frontend/docker-compose.yml`
- `frontend/pnpm-lock.yaml`
- `src/api/agent_routes.py`
- `src/services/adk/agent_builder.py`
- `src/services/adk/custom_agents/workflow_agent.py`
- `src/services/agent_service.py`
- `test_a2a_creation.py` (novo arquivo)
- `test_workflow.json` (novo arquivo)

### Estrutura completa do projeto:
```
evo-ai/
├── frontend/          # Interface React/Next.js
├── src/              # Backend FastAPI
├── migrations/       # Migrações do banco
├── scripts/          # Scripts utilitários
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── README.md
└── ...
```

## Commit atual preparado:

**Mensagem do commit**:
```
feat: Atualização do sistema evo-ai com melhorias nos agentes e workflow

- Atualizações na interface de agentes
- Melhorias no sistema de workflow agents
- Correções no docker-compose do frontend
- Adição de arquivos de teste para criação A2A
- Atualizações nas dependências do frontend
```

## Arquivos principais do projeto:

### Backend (Python/FastAPI):
- **API Routes**: `src/api/` - Rotas da API REST
- **Services**: `src/services/` - Lógica de negócio
- **Models**: `src/models/` - Modelos do banco de dados
- **Config**: `src/config/` - Configurações da aplicação

### Frontend (React/Next.js):
- **Pages**: `frontend/app/` - Páginas da aplicação
- **Components**: `frontend/components/` - Componentes reutilizáveis
- **Services**: `frontend/services/` - Serviços de API
- **Types**: `frontend/types/` - Definições TypeScript

### Funcionalidades principais:
- Sistema de autenticação JWT
- Gerenciamento de agentes IA
- Interface de chat
- Integração com MCP servers
- Sistema de workflow agents
- Suporte a múltiplos clientes

## Próximos passos após upload:

1. Configure as variáveis de ambiente (`.env`)
2. Execute `docker-compose up` para subir os serviços
3. Acesse a aplicação em `http://localhost:3000` (frontend) e `http://localhost:8000` (backend)

---

**Nota**: Este arquivo foi gerado automaticamente para facilitar o processo de upload manual do código.