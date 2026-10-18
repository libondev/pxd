import type { ComponentLabel } from '../../types/shared/props'

export interface StatusDotProps {
  label?: boolean | ComponentLabel
  state?: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
}
