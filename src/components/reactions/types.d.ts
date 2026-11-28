import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentPosition, PopoverTrigger } from '../../types/shared/props'

export type ReactionsChangeReason = Extract<ChangeReason, 'item-press'>

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
  change: [reactions: Reaction[], details: ChangeDetails<ReactionsChangeReason>]
  'update:model-value': [reactions: Reaction[]]
}
