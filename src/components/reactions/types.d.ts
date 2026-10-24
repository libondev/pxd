import type { ComponentPosition } from '../../types/shared/props'
import type { PopoverTrigger } from '../popover/types'

export interface Reaction {
  emoji: string
  count: number
  mine?: boolean
}

export interface ReactionsProps {
  modelValue?: Reaction[]
  emojis?: string[]
  trigger?: PopoverTrigger | PopoverTrigger[]
  position?: ComponentPosition
  disabled?: boolean
}

export interface ReactionsEmits {
  add: [emoji: string]
  remove: [emoji: string]
  change: [reactions: Reaction[]]
  'update:model-value': [reactions: Reaction[]]
}
