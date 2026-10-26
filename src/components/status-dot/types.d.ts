import type { ComponentText } from '../../types/shared/props'

export interface StatusDotProps {
  label?: boolean | ComponentText
  state?: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
}
