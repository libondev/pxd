import type { Locale } from '../../locales'
import type { ComponentSize } from '../../types/shared'

export interface ConfigProviderProps {
  size?: ComponentSize
  locale?: Locale
  enterMotion?: boolean
  leaveMotion?: boolean
}
