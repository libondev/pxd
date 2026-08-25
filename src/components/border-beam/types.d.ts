export type BorderBeamVariant = 'colorful'

export interface BorderBeamColorStop {
  color: string
  position?: number
}

export interface BorderBeamProps {
  variant?: BorderBeamVariant
  color?: string | BorderBeamColorStop[]
  strength?: number
  disabled?: boolean
}
