export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual'

export type PopoverBasePosition = 'top' | 'bottom' | 'left' | 'right'
export type PopoverPosition =
  | PopoverBasePosition
  | `${PopoverBasePosition}-start`
  | `${PopoverBasePosition}-end`
