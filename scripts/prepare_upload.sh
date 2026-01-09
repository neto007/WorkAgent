#!/bin/bash

# Script para preparar o código para upload no GitHub
# Este script cria um arquivo ZIP com todo o projeto e prepara instruções

echo "=== Preparando código para upload no GitHub ==="

# Criar diretório de saída
OUTPUT_DIR="github_upload"
mkdir -p $OUTPUT_DIR

# Função para criar arquivo ZIP
create_zip() {
    echo "Criando arquivo ZIP do projeto..."
    
    # Excluir arquivos desnecessários do ZIP
    zip -r "$OUTPUT_DIR/evo-ai-project.zip" . \
        -x "*.git/*" \
        -x "*__pycache__/*" \
        -x "*.pyc" \
        -x "*node_modules/*" \
        -x "*.env" \
        -x "*.log" \
        -x "*github_upload/*" \
        -x "*prepare_upload.sh"
    
    echo "✅ Arquivo ZIP criado: $OUTPUT_DIR/evo-ai-project.zip"
}

# Função para listar arquivos modificados
list_modified_files() {
    echo "\n=== Arquivos modificados recentemente ==="
    echo "Os seguintes arquivos foram modificados:"
    
    git status --porcelain | while read status file; do
        case $status in
            "M "*) echo "📝 Modificado: $file" ;;
            "A "*) echo "➕ Adicionado: $file" ;;
            "D "*) echo "❌ Removido: $file" ;;
            "??"*) echo "🆕 Novo arquivo: $file" ;;
        esac
    done
}

# Função para criar resumo do projeto
create_project_summary() {
    cat > "$OUTPUT_DIR/PROJECT_SUMMARY.md" << 'EOF'
# Resumo do Projeto EVO-AI

## Descrição
Sistema de IA evolutiva com interface web e backend FastAPI. Plataforma completa para criação e gerenciamento de agentes inteligentes.

## Tecnologias Utilizadas

### Backend
- **FastAPI**: Framework web Python moderno e rápido
- **SQLAlchemy**: ORM para banco de dados
- **PostgreSQL**: Banco de dados principal
- **Redis**: Cache e sessões
- **JWT**: Autenticação
- **Docker**: Containerização

### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn/ui**: Componentes UI
- **WebSocket**: Comunicação em tempo real

## Estrutura do Projeto

```
evo-ai/
├── frontend/                 # Aplicação React/Next.js
│   ├── app/                 # Páginas (App Router)
│   ├── components/          # Componentes reutilizáveis
│   ├── services/           # Serviços de API
│   ├── types/              # Definições TypeScript
│   └── hooks/              # Custom hooks
├── src/                     # Backend FastAPI
│   ├── api/                # Rotas da API
│   ├── services/           # Lógica de negócio
│   ├── models/             # Modelos do banco
│   ├── schemas/            # Schemas Pydantic
│   └── config/             # Configurações
├── migrations/              # Migrações Alembic
├── scripts/                 # Scripts utilitários
└── docker-compose.yml       # Orquestração de containers
```

## Funcionalidades Principais

### Sistema de Agentes
- Criação e gerenciamento de agentes IA
- Suporte a diferentes tipos de agentes (Chat, Task, Workflow)
- Integração com modelos de linguagem (OpenAI, Anthropic, etc.)
- Sistema de workflow para agentes complexos

### Interface de Chat
- Chat em tempo real com agentes
- Suporte a múltiplas sessões
- Histórico de conversas
- Upload de arquivos

### Gerenciamento de Clientes
- Sistema multi-tenant
- Autenticação e autorização
- Perfis de usuário
- Controle de acesso

### MCP Servers
- Integração com Model Context Protocol
- Servidores externos para funcionalidades específicas
- GitHub, PostgreSQL e outros conectores

## Como Executar

1. **Pré-requisitos**:
   - Docker e Docker Compose
   - Node.js 18+ (para desenvolvimento frontend)
   - Python 3.11+ (para desenvolvimento backend)

2. **Configuração**:
   ```bash
   # Copiar arquivo de ambiente
   cp .env.example .env
   
   # Editar variáveis de ambiente conforme necessário
   nano .env
   ```

3. **Executar com Docker**:
   ```bash
   # Subir todos os serviços
   docker-compose up -d
   
   # Verificar logs
   docker-compose logs -f
   ```

4. **Acessar aplicação**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Documentação API: http://localhost:8000/docs

## Desenvolvimento

### Backend
```bash
# Instalar dependências
pip install -r requirements.txt

# Executar migrações
alembic upgrade head

# Executar servidor de desenvolvimento
uvicorn src.main:app --reload
```

### Frontend
```bash
cd frontend

# Instalar dependências
pnpm install

# Executar servidor de desenvolvimento
pnpm dev
```

## Arquivos de Teste

- `test_a2a_creation.py`: Testes para criação de agentes A2A
- `test_workflow.json`: Configuração de teste para workflows

## Licença
Apache License 2.0
EOF

    echo "✅ Resumo do projeto criado: $OUTPUT_DIR/PROJECT_SUMMARY.md"
}

# Função para criar script de configuração Git
create_git_setup_script() {
    cat > "$OUTPUT_DIR/setup_git_repo.sh" << 'EOF'
#!/bin/bash

# Script para configurar repositório Git após upload

echo "=== Configuração do Repositório Git ==="

# Solicitar informações do usuário
read -p "Digite seu username do GitHub: " GITHUB_USER
read -p "Digite o nome do repositório (ex: evo-ai-system): " REPO_NAME

echo "\nConfigurando repositório..."

# Inicializar Git se necessário
if [ ! -d ".git" ]; then
    git init
    echo "✅ Repositório Git inicializado"
fi

# Configurar remote
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "✅ Remote configurado: https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Adicionar todos os arquivos
git add .
echo "✅ Arquivos adicionados ao staging"

# Fazer commit
git commit -m "feat: Sistema EVO-AI completo com agentes inteligentes

- Backend FastAPI com sistema de agentes
- Frontend Next.js com interface moderna
- Sistema de autenticação JWT
- Integração com MCP servers
- Suporte a workflows complexos
- Docker para desenvolvimento e produção"

echo "✅ Commit criado"

# Instruções para push
echo "\n=== Próximos passos ==="
echo "1. Crie o repositório no GitHub: https://github.com/new"
echo "2. Nome do repositório: $REPO_NAME"
echo "3. Execute: git push -u origin main"
echo "\nOu se preferir usar SSH:"
echo "git remote set-url origin git@github.com:$GITHUB_USER/$REPO_NAME.git"
echo "git push -u origin main"
EOF

    chmod +x "$OUTPUT_DIR/setup_git_repo.sh"
    echo "✅ Script de configuração Git criado: $OUTPUT_DIR/setup_git_repo.sh"
}

# Executar funções
list_modified_files
create_zip
create_project_summary
create_git_setup_script

echo "\n=== Preparação concluída ==="
echo "📁 Todos os arquivos estão em: $OUTPUT_DIR/"
echo "\n📋 Próximos passos:"
echo "1. Extrair o arquivo ZIP em um local apropriado"
echo "2. Seguir as instruções em UPLOAD_INSTRUCTIONS.md"
echo "3. Ou executar o script setup_git_repo.sh para configuração automática"
echo "\n🚀 Seu projeto está pronto para ser enviado ao GitHub!"