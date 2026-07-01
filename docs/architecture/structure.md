# Project Structure

## Root Level Organization

```
├── src/                    # Application source (see below)
├── public/                 # Static assets, PWA icons
├── docs/                   # User and developer documentation
├── scripts/                # Build and utility scripts
├── vite.config.ts          # Vite + vite-plugin-pwa config
├── tsconfig.json
└── vitest.config.ts        # or merged into vite.config.ts
```

## `src/` Organization

```
src/
├── main.tsx                 # App entry point, mounts router + providers
├── routes/                  # TanStack Router file-based routes
│   ├── __root.tsx           # Root layout (nav shell, providers)
│   ├── index.tsx             # Home — default Category view
│   ├── time.tsx               # Time Commitment view
│   ├── tasks.$taskId.tsx      # Add/Edit task (new vs. existing id)
│   └── settings.tsx
├── components/               # Reusable UI components, by domain
│   ├── ui/                   # shadcn/ui primitives (owned, generated via CLI)
│   ├── task/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskCompletionButton.tsx
│   ├── category/
│   │   ├── CategoryBadge.tsx
│   │   └── CategoryForm.tsx
│   └── layout/
│       ├── AppShell.tsx
│       └── BottomNav.tsx
├── lib/                       # Business logic — plain functions, not classes
│   ├── db/
│   │   └── schema.ts          # Dexie class, table schema, versioning
│   ├── tasks.ts                # createTask, markTaskComplete, archiveTask, ...
│   ├── categories.ts            # createCategory, deleteCategory (with reassignment), ...
│   ├── overdue.ts                # pure calculateOverdue(task) — easy to unit test
│   ├── time-format.ts             # human-readable elapsed time ("3 weeks ago")
│   └── export-import.ts            # dexie-export-import + CSV (PapaParse or similar)
├── schemas/                   # Zod v4 schemas (source of truth for validation)
│   ├── task.ts
│   ├── category.ts
│   └── settings.ts
├── stores/                    # Zustand — transient UI-only state
│   └── ui-store.ts
├── types/                     # TypeScript types, mostly z.infer<typeof schema>
│   └── index.ts
├── styles/
│   └── globals.css            # Tailwind v4 @theme tokens
└── test/                      # Vitest setup (fake-indexeddb, RTL config, vitest-axe)
    └── setup.ts
```

## File Naming Conventions

- **Components**: PascalCase with descriptive names (`TaskCard.tsx`)
- **Routes**: TanStack Router file-based convention (`tasks.$taskId.tsx`)
- **lib functions**: camelCase plural modules by domain (`tasks.ts`, not `TaskService.ts`)
  — no `Service` suffix, since there's no class to suffix
- **Schemas**: camelCase matching domain (`task.ts`), exporting `taskSchema` /
  `createTaskSchema`
- **Stores**: camelCase ending in `-store` (`ui-store.ts`)

## Component File Structure

```
TaskCard/
├── TaskCard.tsx
├── TaskCard.test.tsx
└── TaskCard.stories.tsx   # optional — Storybook not required for this option
```

## Import Path Conventions

- `@/` alias for absolute imports from `src/` (same convention as A and B)
- Named exports preferred over default exports
- External libraries, then internal modules, grouped and sorted by ESLint

## Testing Structure

- Unit tests co-located with the module they cover (`tasks.test.ts` next to `tasks.ts`)
- `fake-indexeddb` gives Dexie a real in-memory IndexedDB under Vitest's Node
  environment — no DB-abstraction class to mock, because there isn't one
- Component tests co-located (`TaskCard.test.tsx`)
- `test/setup.ts` wires up `fake-indexeddb/auto`, RTL's `cleanup`, and `vitest-axe`'s
  matchers globally
- Playwright E2E specs live outside `src/`, in `e2e/`

## Configuration Files

- `vite.config.ts` — Vite + `@vitejs/plugin-react` + `vite-plugin-pwa` +
  `@tailwindcss/vite`
- `tsconfig.json` — TypeScript configuration, `@/*` path alias
- `vitest.config.ts` — test environment (`jsdom`), setup file
- `components.json` — shadcn/ui CLI config (component output paths, Tailwind v4 mode)
- `eslint.config.mjs`, `.prettierrc` — linting and formatting
