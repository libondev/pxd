import type { ComponentLabel } from '../../types/shared'

export interface StatusDotProps {
  label?: boolean | ComponentLabel
  state?: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
}
