---
description: Describe when these instructions should be loaded by the agent based on task context
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Core Principles

1. **Prefer Server Components**
   - Use React Server Components by default.
   - Only create Client Components when interaction or hooks are required.

2. **Performance First**
   - Avoid unnecessary client-side JavaScript.
   - Prefer server data fetching.
   - Use Next.js caching (`revalidate`) appropriately.

3. **Type Safety**
   - TypeScript must be used everywhere.
   - Avoid `any`.
   - Prefer explicit return types for exported functions.

4. **Component Reusability**
   - Shared UI must live in `components/`.
   - Route-specific UI can live inside `app/<route>/components/`.

5. **Clean Separation**
   - UI components should not contain heavy business logic.
   - Data fetching belongs in `lib/`.

---

# Architecture Rules

## Data Fetching

Data fetching must follow this pattern:

```
app/page.tsx
   ↓
lib/getData.ts
   ↓
Prismic API
```

Example:

```ts
// lib/getHomeData.ts
import { createClient } from "@/utils/prismic";

export async function getHomeData() {
  const client = createClient();
  return client.getSingle("home");
}
```

Then in the page:

```ts
import { getHomeData } from "@/lib/getHomeData";

export default async function Page() {
  const data = await getHomeData();
  return <Home data={data} />;
}
```

Never call CMS APIs directly inside UI components.

---

# Component Guidelines

## Server Components

Default pattern:

```tsx
export default function Component() {
  return <div />;
}
```

No `"use client"` unless required.

---

## Client Components

Use only when needed:

- React hooks
- Browser APIs
- Interactive UI
- State management

Example:

```tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

# Styling Rules

Styling must follow the **Tailwind + CVA architecture**.

## Base Rules

- Use Tailwind utilities.
- Avoid inline styles.
- Avoid global CSS unless necessary.
- Prefer reusable component variants.

## Variant Pattern

All UI components with variants must use **CVA**.

Example:

```ts
const card = cva("rounded-lg border p-4", {
  variants: {
    variant: {
      default: "bg-white",
      muted: "bg-muted",
    },
  },
});
```

---

# Class Merging

Always merge Tailwind classes safely.

Pattern:

```
cva + clsx + tailwind-merge
```

Example:

```ts
className={twMerge(componentVariants({ variant }), clsx(className))}
```

---

# File Naming Conventions

| Type           | Convention           |
| -------------- | -------------------- |
| Components     | `PascalCase.tsx`     |
| Hooks          | `useSomething.ts`    |
| Utilities      | `camelCase.ts`       |
| Data functions | `getSomething.ts`    |
| Types          | `something.types.ts` |

Examples:

```
Header.tsx
HeroSection.tsx
useScroll.ts
getHomeData.ts
home.types.ts
```

---

# Folder Usage Rules

## `app/`

Contains routes and layouts.

Example:

```
app/
   layout.tsx
   page.tsx
   blog/
      page.tsx
      components/
```

---

## `components/`

Reusable UI components.

Example:

```
components/
   Header.tsx
   Footer.tsx
   ui/
      button.tsx
      card.tsx
```

---

## `lib/`

Data logic and external integrations.

Examples:

```
lib/
   getHomeData.ts
   getPosts.ts
```

---

## `utils/`

Generic helpers.

Examples:

```
utils/
   prismic.ts
   formatDate.ts
```

---

## `types/`

Shared TypeScript types.

Examples:

```
types/
   home.types.ts
   post.types.ts
```

---

# Prismic Integration Rules

1. Prismic client configuration lives in:

```
utils/prismic.ts
```

2. Data functions belong in `lib/`.

3. Slices must use **generated types** when possible.

4. Avoid manual type duplication.

---

# Performance Rules

## Images

Use `next/image` whenever possible.

Example:

```tsx
import Image from "next/image";
```

---

## Fonts

Use:

```
next/font
```

Never use Google Fonts `<link>` tags.

---

## Caching

Use ISR where possible:

```ts
export const revalidate = 60;
```

or

```ts
fetch(url, {
  next: { revalidate: 60 },
});
```

---

# Code Quality

## ESLint

Code must pass ESLint rules.

Run:

```
npm run lint
```

---

## Avoid

- deeply nested components
- large files (>300 lines)
- duplicated logic
- unnecessary client components

---

# Accessibility

Follow accessibility best practices:

- Use semantic HTML
- Prefer accessible primitives (Radix)
- Include `alt` text for images
- Ensure keyboard navigation works

---

# Commit Guidelines

Recommended commit pattern:

```
feat: add hero section
fix: correct mobile navigation
refactor: simplify header component
style: adjust tailwind spacing
```

---

# Documentation

When creating complex components:

- Add comments explaining logic
- Document props with TypeScript
- Prefer self-documenting code
