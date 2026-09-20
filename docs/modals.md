# Modals

The modal system is a registry-driven dialog manager. Instead of rendering
dialogs inline, you register them once and open them by name from anywhere in
the app with a fully typed API. Modals stack, and only the topmost modal can be
closed.

Files live in `src/components/modals`:

| File                 | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `modal-registry.tsx` | The map of modal name → component, plus the exported types. |
| `modal-provider.tsx` | Holds modal state and renders the active modals.            |
| `modal-renderer.tsx` | Wraps a registered component in the base `<Dialog>`.        |
| `useModal.ts`        | The context and `useModal()` hook.                          |

## 1. Mount the provider

Wrap the part of the tree that needs modals (usually the root layout body) in
`ModalProvider`. The provider is a client component and uses `sonner` for the
"not registered" warning, so a `<Toaster />` must be mounted too.

```tsx
"use client"

import { Toaster } from "sonner"
import { ModalProvider } from "@/components/modals/modal-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      {children}
      <Toaster />
    </ModalProvider>
  )
}
```

## 2. Create a modal component

A modal component receives `data` (the payload passed when opening) and
`closeModal`. It must render its own `<DialogContent>` (with a title), because
the renderer only supplies the `<Dialog>` root.

```tsx
// src/components/modals/confirm-modal.tsx
"use client"

import type { ModalComponentProps } from "./modal-registry"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ConfirmData = { title: string; description?: string }

export function ConfirmModal({
  data,
  closeModal,
}: ModalComponentProps<ConfirmData>) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{data.title}</DialogTitle>
        {data.description && (
          <DialogDescription>{data.description}</DialogDescription>
        )}
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button onClick={closeModal}>Confirm</Button>
      </DialogFooter>
    </DialogContent>
  )
}
```

## 3. Register it

Add the component to `modalRegistry` in `modal-registry.tsx`. The keys become
the valid modal names, and each component's `data` prop type is inferred
automatically.

```tsx
import { type FC } from "react"
import { ConfirmModal } from "./confirm-modal"

export const modalRegistry = {
  confirm: ConfirmModal,
} as const
```

Keep `placeholder` only while the registry is empty — every key must be a
modal component.

> Use `import type` for `ModalComponentProps` in modal files. The registry
> imports the modal component, so a value import back into the registry would
> create a cycle.

## 4. Open and close

```tsx
"use client"

import { useModal } from "@/components/modals/useModal"
import { Button } from "@/components/ui/button"

export function DeleteButton({ id }: { id: string }) {
  const { openModal } = useModal()

  return (
    <Button
      variant="destructive"
      onClick={() => openModal("confirm", { title: `Delete ${id}?` })}
    >
      Delete
    </Button>
  )
}
```

`useModal()` returns:

| Field            | Type                            | Description                                     |
| ---------------- | ------------------------------- | ----------------------------------------------- |
| `openModal`      | `(name, data) => void`          | Opens a modal. `name` and `data` are type-safe. |
| `closeModal`     | `(modalId: string) => void`     | Closes a modal by id (only if it is topmost).   |
| `modals`         | `ModalContextType<ModalName>[]` | The current modal stack.                        |
| `currentModalId` | `string \| null`                | Id of the topmost modal, or `null`.             |

Opening a modal with a name that is not in the registry logs a
`sonner` warning and does nothing.

## Stacking behaviour

- Opening from the page pushes onto the stack.
- Opening from inside a modal stacks a new modal on top.
- `closeModal(id)` only closes the modal if it is the topmost one; otherwise it
  is ignored. This prevents a background modal from closing itself while a
  child modal is open.

## Types

All exported from `modal-registry.tsx`:

| Type                        | Description                                                   |
| --------------------------- | ------------------------------------------------------------- |
| `ModalRegistry`             | `typeof modalRegistry`.                                       |
| `ModalName`                 | Union of registered modal names.                              |
| `ModalProps<T>`             | The props of the component registered under name `T`.         |
| `ModalContextType<K>`       | `{ name: K; data: ModalProps<K>["data"] } \| { name: null }`. |
| `OpenModalFunction`         | Typed `openModal` signature.                                  |
| `ModalComponentProps<Data>` | `{ data: Data; closeModal: () => void }`.                     |
