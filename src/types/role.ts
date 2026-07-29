import { IconDefinition } from '@fortawesome/free-solid-svg-icons'

export type Role = 'user' | 'caretaker'

export interface RoleOption {
    id: Role
    title: string
    description: string
    icon: IconDefinition
}
