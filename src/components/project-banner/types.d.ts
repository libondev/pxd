import type { ComponentLabel } from '../../types/shared'

export type ProjectBannerVariant = 'default' | 'warning' | 'error' | 'success' | 'info'

export interface ProjectBannerProps {
  label?: ComponentLabel
  variant?: ProjectBannerVariant
}
