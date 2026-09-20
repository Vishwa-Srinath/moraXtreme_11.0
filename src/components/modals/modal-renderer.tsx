"use client"

import { Dialog } from "@/components/ui/dialog"
import {
  type ModalContextType,
  type ModalName,
  modalRegistry,
} from "./modal-registry"

type ModalRendererProps = {
  modal: ModalContextType<ModalName>
  modalId: string
  closeModal: (modalId: string) => void
}

export function ModalRenderer({
  modal,
  modalId,
  closeModal,
}: ModalRendererProps) {
  if (!modal.name) return null

  const ModalContent = modalRegistry[modal.name]

  return (
    <Dialog open={true} onOpenChange={() => closeModal(modalId)}>
      <ModalContent
        closeModal={() => closeModal(modalId)}
        //  eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={modal.data as any}
      />
    </Dialog>
  )
}
