import type { Locale } from '../../locales'
import type { ComponentSize, DeepPartial } from '../../types/shared'

export interface ConfigProviderProps {
  size?: ComponentSize
  locale?: DeepPartial<Locale>
  enterMotion?: boolean
  leaveMotion?: boolean
}
