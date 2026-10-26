import type { ComponentText } from '../../types/shared/props'

export type ProjectBannerVariant = 'default' | 'warning' | 'error' | 'success' | 'info'

export interface ProjectBannerProps {
  label?: ComponentText
  variant?: ProjectBannerVariant
}
