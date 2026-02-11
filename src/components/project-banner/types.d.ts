import type { ComponentLabel } from '../../types/shared'

export type ProjectBannerVariant = 'warning' | 'error' | 'success' | 'info'

export interface ProjectBannerProps {
  label?: ComponentLabel
  variant?: ProjectBannerVariant
}
