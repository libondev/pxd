import type { ComponentSize } from '../../types/shared'

export interface ConfigProviderProps {
  size?: ComponentSize
  locale?: Record<string, any>
  popoverShowTransition?: boolean
}
