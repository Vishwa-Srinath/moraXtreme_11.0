import { createContext, useContext } from "react"
import type {
  ModalContextType,
  ModalName,
  OpenModalFunction,
} from "./modal-registry"

interface ModalContextProps {
  modals: ModalContextType<ModalName>[]
  openModal: OpenModalFunction
  closeModal: (modalId: string) => void
  currentModalId: string | null
}

export const ModalContext = createContext<ModalContextProps | null>(null)

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error("useModal must be used within ModalProvider")
  return ctx
}
