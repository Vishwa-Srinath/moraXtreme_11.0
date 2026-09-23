<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project docs

Before building or changing forms or modals, read the relevant guide:

- `docs/forms.md` — `Form`, `Form.Item`, `Form.CustomController`, `FormListInput`, and the ready-made inputs (`CheckboxInput`, `TagsInput`).
- `docs/modals.md` — the registry-driven modal system, `ModalProvider`, and `useModal()`.
- `LAYOUT.md` — route shell, container, grid, scroll, and registration layout architecture.

Form components live in `src/components/form`, inputs in `src/components/form-inputs`, and modals in `src/components/modals`.
