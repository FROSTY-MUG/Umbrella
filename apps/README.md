# apps/

Frontend applications for Umbrella OS.

## Structure

```
apps/
└── desktop/        # @umbrella/desktop — Next.js 15 browser desktop OS
```

## Running

```powershell
# From repo root
pnpm run dev          # starts frontend on http://localhost:3000

# Or from this directory
pnpm --filter @umbrella/desktop dev
```

## Desktop app

The desktop app is the entire Umbrella OS user interface. It renders as a full-viewport browser application styled as a desktop OS with:

- Draggable, resizable windows
- A taskbar with clock and window management
- An app launcher overlay
- 17 built-in scientific applications

All window state is managed by a Zustand store in `apps/desktop/lib/store.ts`.

The app communicates with the FastAPI backend at `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`).

See [ARCHITECTURE.md](../ARCHITECTURE.md) for a full component tree and data flow description.

## Planned packages (not yet created)

The `packages/` workspace directory at the repo root is reserved for:
- `packages/app-sdk` — shared app development kit for Forge-generated apps
- `packages/ui` — shared UI component library
- `packages/shared-types` — TypeScript types shared between apps and services
- `packages/runtime` — OS runtime utilities
- `packages/permissions` — capability-gated permissions system
