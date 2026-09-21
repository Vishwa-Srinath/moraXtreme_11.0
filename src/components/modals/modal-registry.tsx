import { TeamMembersModal } from "./team-members-modal"

export const modalRegistry = {
  teamMembers: TeamMembersModal,
} as const

// Helper types
export type ModalRegistry = typeof modalRegistry
export type ModalName = keyof ModalRegistry
export type ModalProps<T extends ModalName> = React.ComponentProps<
  ModalRegistry[T]
>
export type ModalContextType<K extends ModalName> =
  | {
      name: K
      data: ModalProps<K>["data"]
    }
  | { name: null }
export type OpenModalFunction = <K extends ModalName>(
  name: K,
  data: ModalProps<K>["data"]
) => void
export type ModalComponentProps<Data> = {
  data: Data
  closeModal: () => void
}
