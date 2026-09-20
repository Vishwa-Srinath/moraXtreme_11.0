import { useCallback, useState, type ReactNode } from "react"
import { toast } from "sonner"
import {
  modalRegistry,
  type ModalContextType,
  type ModalName,
  type OpenModalFunction,
} from "./modal-registry"
import { ModalRenderer } from "./modal-renderer"
import { ModalContext } from "./useModal"

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<
    (ModalContextType<ModalName> & { id: string })[]
  >([])

  const openModal = useCallback<OpenModalFunction>((name, data) => {
    const isAvailableAction = Object.prototype.hasOwnProperty.call(
      modalRegistry,
      name
    )

    if (!isAvailableAction) {
      toast.warning(`Modal action "${name}" is not registered.`)
      return
    }

    const modalId = Math.random().toString(36).substring(2, 11)

    setModals((prev) => {
      // If there are no modals open (called from dashboard), replace
      if (prev.length === 0) {
        return [{ id: modalId, name, data }]
      }
      // If modals are already open (called from within a modal), stack
      return [...prev, { id: modalId, name, data }]
    })
  }, [])

  const closeModal = (modalId: string) => {
    setModals((prev) => {
      // Only close if the modal is the last one (the one calling closeModal)
      if (prev.length > 0 && prev[prev.length - 1].id === modalId) {
        return prev.slice(0, -1)
      }
      // Safety: don't close if it's not the topmost modal
      return prev
    })
  }

  const currentModalId = modals.length > 0 ? modals[modals.length - 1].id : null

  return (
    <ModalContext.Provider
      value={{ modals, openModal, closeModal, currentModalId }}
    >
      {children}
      {modals.map((modal) => (
        <ModalRenderer
          key={modal.id}
          modal={modal}
          modalId={modal.id}
          closeModal={closeModal}
        />
      ))}
    </ModalContext.Provider>
  )
}
