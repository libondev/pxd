import type { ComponentText } from '../../types/shared/props'

export interface StatusDotProps {
  label?: ComponentText
  showLabel?: boolean
  status?: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
}
