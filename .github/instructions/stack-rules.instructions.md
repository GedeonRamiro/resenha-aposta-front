---
description: Describe when these instructions should be loaded by the agent based on task context
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Stack Rules & Coding Guidelines

## Contexto do Projeto

Este projeto utiliza as seguintes tecnologias principais:

- **Next.js 16+** (App Router, server/client components)
- **React 19**
- **TypeScript**
- **TailwindCSS**
- **Radix UI** e **shadcn**
- **Zustand** (estado global)
- **next-themes** (temas)
- **ESLint** (linting)

## Regras Gerais

- Sempre use **TypeScript** com tipagem forte. Evite `any` e prefira `type` ou `interface` para definir contratos.
- Siga a estrutura de pastas do Next.js (App Router). Separe componentes reutilizáveis em `components/` e utilitários em `lib/`.
- Prefira **Client Components** apenas quando necessário (hooks, interatividade). Use **Server Components** para renderização estática/SSR.
- Utilize **React hooks** modernos (ex: `useState`, `useEffect`, `useContext`, `useRef`, `useCallback`).
- Para estado global, utilize **Zustand**. Não use Context API para estados globais complexos.
- Sempre que for estilizar componentes, priorize o uso dos componentes do **shadcn/ui**. Só utilize TailwindCSS puro ou Radix UI diretamente se não houver componente correspondente no shadcn/ui ou se houver necessidade de customização específica.
- Use **TailwindCSS** para estilização complementar. Prefira classes utilitárias e evite CSS customizado, exceto para temas ou casos especiais.
- Para animações, utilize utilitários do Tailwind ou bibliotecas aprovadas no projeto.
- Utilize **Radix UI** e **shadcn** para componentes acessíveis e customizáveis. Não reimplemente componentes básicos (ex: Dialog, Tooltip, Button) se já existirem nessas libs.
- Para temas, utilize **next-themes**. Sempre garanta acessibilidade (contraste, aria-labels, etc) ao alternar temas.
- Siga as regras do **ESLint** e corrija todos os avisos/erros antes de commitar.
- Sempre priorize acessibilidade (a11y) e performance. Use atributos ARIA, roles e garanta navegação por teclado.
- Organize imports: bibliotecas externas primeiro, depois internas, depois CSS.
- Use **React 19** features quando aplicável (ex: server actions, useOptimistic, etc).
- Documente funções/utilitários complexos com comentários JSDoc.
- Prefira funções puras e componentes funcionais.
- Não exponha dados sensíveis no client.

## Exemplos de Boas Práticas

```tsx
// Exemplo de tipagem forte
type User = {
  id: string;
  name: string;
};

// Exemplo de uso de Zustand
import { create } from "zustand";
type Store = { count: number; inc: () => void };
export const useStore = create<Store>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

// Exemplo de componente com Tailwind e acessibilidade
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="px-4 py-2 rounded bg-primary text-white focus:outline-none focus:ring"
      aria-label="Botão customizado"
    >
      {children}
    </button>
  );
}
```

## Quando aplicar estas instruções

- Sempre que gerar, revisar ou modificar código relacionado a React, Next.js, Zustand, Tailwind, Radix UI, shadcn, temas ou tipagem TypeScript.
- Sempre que houver dúvidas sobre padrões de organização, acessibilidade, performance ou estilização.

---

Mantenha este arquivo atualizado conforme novas tecnologias ou padrões forem adotados no projeto.
