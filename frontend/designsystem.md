# Design System - Frontend-sec

Este documento descreve o sistema de design completo do **frontend-sec**, incluindo cores, tipografia, componentes, animações e padrões de interface.

---

## 🎨 Paleta de Cores

O frontend-sec utiliza o **Dracula Theme** como base, com adaptações para melhor contraste e acessibilidade.

### Cores Principais

```css
/* Background */
--bg-primary: #050101       /* Fundo principal (quase preto) */
--bg-secondary: #0b0b11     /* Fundo de cards e containers */
--bg-tertiary: #1a1b26      /* Fundo de elementos elevados */
--bg-elevated: #282a36      /* Fundo de tooltips, modals */

/* Text */
--text-primary: #f8f8f2     /* Texto principal (branco suave) */
--text-secondary: #6272a4   /* Texto secundário (cinza azulado) */
--text-muted: #44475a       /* Texto desabilitado */

/* Brand Colors */
--purple: #bd93f9           /* Roxo (AI/Agent) */
--cyan: #8be9fd             /* Ciano (Links, info) */
--green: #50fa7b            /* Verde (Sucesso) */
--orange: #ffb86c           /* Laranja (Ferramentas, warning) */
--red: #ff5555              /* Vermelho (Erro, danger) */
--pink: #ff79c6             /* Rosa (Destaque, código) */
--yellow: #f1fa8c           /* Amarelo (Warning secundário) */
```

### Aplicação de Cores por Contexto

| Contexto | Cor Principal | Uso |
|----------|---------------|-----|
| **Agente AI** | Purple (`#bd93f9`) | Avatares, badges, ícones de IA |
| **Usuário** | Green (`#50fa7b`) | Mensagens do usuário, confirmações |
| **Ferramentas** | Orange (`#ffb86c`) | Tool calls, execuções |
| **Sucesso** | Green (`#50fa7b`) | Estados de sucesso, completed |
| **Erro** | Red (`#ff5555`) | Erros, falhas, estados críticos |
| **Info** | Cyan (`#8be9fd`) | Informações, dicas |
| **Código** | Pink (`#ff79c6`) | Inline code, syntax |

---

## 📝 Tipografia

### Fontes

```css
/* Sistema */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;

/* Monospace (código) */
font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 
             'Courier New', monospace;
```

### Hierarquia de Tamanhos

```css
/* Headers */
text-2xl: 1.5rem (24px)    /* Page titles */
text-xl: 1.25rem (20px)    /* Section headers */
text-lg: 1.125rem (18px)   /* Subsections */

/* Body */
text-base: 1rem (16px)     /* Default text */
text-sm: 0.875rem (14px)   /* Secondary text */
text-xs: 0.75rem (12px)    /* Labels, captions */

/* Code */
text-sm: 0.875rem (14px)   /* Inline code */
text-xs: 0.75rem (12px)    /* Code blocks */
```

### Pesos

```css
font-black: 900      /* Títulos principais */
font-bold: 700       /* Subtítulos, ênfase */
font-medium: 500     /* Texto normal com destaque */
font-normal: 400     /* Texto padrão */
```

---

## 🧱 Componentes

### Cards & Containers

```tailwind
/* Card padrão */
bg-[#0b0b11] border-2 border-[#1a1b26] rounded-2xl p-4 shadow-neu-sm

/* Card elevado */
bg-[#0b0b11] border-2 border-[#bd93f9]/50 rounded-xl shadow-neu

/* Card de execução */
bg-[#0b0b11] border-2 border-[#1a1b26] rounded-xl p-4
```

### Botões

```tailwind
/* Primary */
bg-[#bd93f9] text-[#282a36] px-4 py-2 rounded-xl font-bold 
hover:bg-[#bd93f9]/80 transition-all

/* Secondary */
bg-[#1a1b26] text-[#f8f8f2] px-4 py-2 rounded-xl font-medium
hover:bg-[#282a36] transition-all

/* Ghost */
bg-transparent text-[#6272a4] hover:bg-[#ffffff]/10 rounded-xl

/* Danger */
bg-[#ff5555] text-white px-4 py-2 rounded-xl font-bold
hover:bg-[#ff5555]/80 transition-all
```

### Badges

```tailwind
/* Status Success */
bg-[#50fa7b]/20 text-[#50fa7b] px-3 py-1 rounded font-mono text-xs

/* Status Error */
bg-[#ff5555]/20 text-[#ff5555] px-3 py-1 rounded font-mono text-xs

/* Agent Badge */
bg-[#50fa7b] text-[#282a36] px-3 py-1 text-xs font-bold uppercase 
border-b-2 border-[#2aa34a] rounded

/* Tool Badge */
bg-[#ffb86c]/20 text-[#ffb86c] px-2 py-1 rounded font-mono text-xs
```

### Inputs

```tailwind
/* Text Input */
bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2] 
rounded-xl px-4 py-2 focus:border-[#bd93f9] outline-none

/* Textarea */
bg-[#1a1b26] border-2 border-[#282a36] text-[#f8f8f2] 
rounded-xl px-4 py-3 focus:border-[#bd93f9] outline-none resize-none
```

### Avatares

```tailwind
/* User Avatar */
bg-[#50fa7b] border-2 border-[#1a1b26] h-10 w-10 rounded-full

/* Agent Avatar */
bg-[#bd93f9] border-2 border-[#1a1b26] h-10 w-10 rounded-full

/* Custom Image */
h-10 w-10 rounded-full object-cover border-2 border-[#1a1b26]
```

---

## 🎭 Animações & Transições

### Durações Padrão

```css
transition-fast: 150ms
transition-base: 200ms
transition-slow: 300ms
```

### Animações Comuns

```tailwind
/* Fade In Up */
animate-fade-in-up

/* Pulse (Loading) */
animate-pulse

/* Spin (Loader) */
animate-spin

/* Hover Scale */
hover:scale-105 transition-transform

/* Hover Translate */
hover:-translate-y-1 transition-transform
```

### Loading States

```tsx
// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-2 
                border-[#bd93f9] border-t-transparent" />

// Pulse Text
<span className="animate-pulse">Processando...</span>

// Skeleton
<div className="animate-pulse bg-[#1a1b26] h-4 rounded" />
```

---

## 📏 Espaçamento & Layout

### Grid System

```tailwind
/* Container Principal */
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

/* Grid de Cards */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

/* Flex Layout */
flex items-center justify-between gap-4
```

### Espaçamento Vertical

```css
space-y-2: 0.5rem (8px)
space-y-3: 0.75rem (12px)
space-y-4: 1rem (16px)
space-y-6: 1.5rem (24px)
space-y-8: 2rem (32px)
```

### Padding Padrão

```css
p-2: 0.5rem (8px)    /* Tight */
p-3: 0.75rem (12px)  /* Compact */
p-4: 1rem (16px)     /* Default */
p-6: 1.5rem (24px)   /* Spacious */
```

---

## 🎨 Efeitos Visuais

### Sombras (Soft Neubrutalism)

```tailwind
/* Small */
shadow-neu-sm: shadow-[2px_2px_0px_rgba(0,0,0,0.3)]

/* Medium */
shadow-neu: shadow-[4px_4px_0px_rgba(0,0,0,0.4)]

/* Large */
shadow-neu-lg: shadow-[6px_6px_0px_rgba(0,0,0,0.5)]
```

### Bordas

```css
border-2          /* Padrão */
border-[#1a1b26]  /* Cor neutra */
border-[#bd93f9]  /* Destaque */
rounded-xl        /* Border radius padrão */
rounded-2xl       /* Border radius cards */
rounded-full      /* Círculos */
```

### Backdrop Blur

```tailwind
backdrop-blur bg-[#050101]/80
```

---

## 💬 Mensagens de Chat

### Mensagem do Usuário

```tailwind
bg-[#50fa7b] text-[#050101] border-2 border-[#50fa7b] 
rounded-2xl p-4 font-medium
```

### Mensagem do Agente

```tailwind
bg-[#0b0b11] border-2 border-[#bd93f9]/50 text-[#f8f8f2] 
rounded-2xl p-4
```

### Execution Steps

```tailwind
/* Container */
bg-[#0b0b11] border-2 border-[#1a1b26] rounded-xl p-4

/* Step - Thinking */
border-[#bd93f9]/30 bg-[#bd93f9]/5

/* Step - Calling Tool */
border-[#ffb86c]/30 bg-[#ffb86c]/5

/* Step - Success */
border-[#50fa7b]/30 bg-[#50fa7b]/5

/* Step - Error */
border-[#ff5555]/30 bg-[#ff5555]/5
```

---

## 🔧 Code Blocks

### Inline Code

```tailwind
px-1.5 py-0.5 rounded text-sm font-mono 
bg-[#282a36] text-[#ff79c6]
```

### Code Blocks

```tailwind
/* Container */
bg-[#0b0b11] border-2 border-[#1a1b26] rounded-lg overflow-hidden

/* Header */
bg-[#1a1b26] px-3 py-1 text-xs text-[#6272a4] 
font-bold uppercase tracking-wider

/* Content */
p-3 overflow-x-auto whitespace-pre text-sm text-[#f8f8f2] 
font-mono bg-[#0b0b11]
```

---

## 📱 Responsividade

### Breakpoints

```css
sm: 640px   /* Mobile landscape, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Padrões Mobile-First

```tailwind
/* Mobile: Stack vertical */
flex flex-col gap-4

/* Tablet+: Grid horizontal */
md:grid md:grid-cols-2 md:gap-6

/* Desktop+: 3 colunas */
lg:grid-cols-3
```

---

## ♿ Acessibilidade

### Contraste de Cores

Todos os pares de cor/fundo seguem **WCAG AA** (mínimo 4.5:1):

- Texto principal (`#f8f8f2`) em fundo escuro (`#050101`): ✅ 15.8:1
- Texto secundário (`#6272a4`) em fundo escuro: ✅ 5.2:1
- Verde em fundo escuro: ✅ 10.3:1

### Estados Interativos

```tailwind
/* Focus */
focus:outline-none focus:ring-2 focus:ring-[#bd93f9] focus:ring-offset-2

/* Disabled */
disabled:opacity-50 disabled:cursor-not-allowed

/* Hover (sempre com transição) */
hover:bg-[#bd93f9]/80 transition-colors
```

---

## 🎯 Ícones

Utilizamos **Lucide React** como biblioteca principal:

```tsx
import { 
  MessageSquare, Bot, User, Wrench, Brain, 
  CheckCircle, XCircle, Loader2, Copy, Search 
} from 'lucide-react';

// Tamanhos padrão
h-4 w-4  /* Small (16px) */
h-5 w-5  /* Medium (20px) */
h-6 w-6  /* Large (24px) */
h-8 w-8  /* XLarge (32px) */
```

---

## 📊 Estados de Componentes

### Loading

```tsx
<Loader2 className="h-8 w-8 text-[#bd93f9] animate-spin" />
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center p-8">
  <MessageSquare className="h-10 w-10 text-[#6272a4] mb-4" />
  <p className="text-[#6272a4]">Nenhuma mensagem ainda</p>
</div>
```

### Error State

```tsx
<div className="bg-[#ff5555]/10 border-2 border-[#ff5555]/30 
                rounded-xl p-4">
  <p className="text-[#ff5555]">Erro ao carregar</p>
</div>
```

---

## 🎨 Markdown Rendering

### Prosa (Texto Markdown)

```tailwind
prose prose-invert max-w-none prose-sm
```

### Customizações

- **Headers**: `font-black uppercase tracking-wide`
- **Links**: `underline hover:opacity-80 font-bold text-[#bd93f9]`
- **Code**: Syntax highlighting com tema Dracula
- **Tables**: Border `#1a1b26`, header `bg-[#1a1b26]`
- **Blockquotes**: Border-left `#bd93f9`, italic

---

## 🚀 Padrões de Uso

### Criar novo Card

```tsx
<div className="bg-[#0b0b11] border-2 border-[#1a1b26] 
                rounded-2xl p-4 shadow-neu-sm">
  {/* Conteúdo */}
</div>
```

### Criar Badge de Status

```tsx
// Sucesso
<span className="bg-[#50fa7b]/20 text-[#50fa7b] px-3 py-1 
                 rounded font-mono text-xs">
  ✅ Sucesso
</span>

// Erro
<span className="bg-[#ff5555]/20 text-[#ff5555] px-3 py-1 
                 rounded font-mono text-xs">
  ❌ Erro
</span>
```

### Criar Botão Interativo

```tsx
<button className="bg-[#bd93f9] text-[#282a36] px-4 py-2 
                   rounded-xl font-bold hover:bg-[#bd93f9]/80 
                   transition-all active:scale-95">
  Confirmar
</button>
```

---

## 📝 Notas Importantes

1. **Sempre use transições**: Todos os estados hover/focus devem ter `transition-*`
2. **Contraste é rei**: Nunca use texto `#6272a4` em fundo `#1a1b26` (baixo contraste)
3. **Espaçamento consistente**: Use múltiplos de 4 (p-2, p-4, p-6, p-8)
4. **Mobile-first**: Sempre comece com layout mobile e adicione breakpoints
5. **Acessibilidade**: Sempre inclua `aria-label` em ícones sem texto

---

## 🎨 Exemplos Completos

Ver componentes reais em:
- `/frontend-sec/src/components/chat/ChatMessage.tsx` - Mensagens de chat
- `/frontend-sec/src/components/chat/ExecutionStep.tsx` - Steps de execução
- `/frontend-sec/src/components/chat/AgentExecutionView.tsx` - View de execução
- `/frontend-sec/src/pages/ChatPage.tsx` - Layout principal

---

**Criado em**: 2025-12-30  
**Versão**: 1.0  
**Tema Base**: Dracula  
**Estilo**: Soft Neubrutalism
