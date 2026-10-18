import type { Locale } from '../../locales'
import type { ComponentSize } from '../../types/shared/props'
import type { DeepPartial } from '../../types/shared/utils'

export interface ConfigProviderProps {
  size?: ComponentSize
  locale?: DeepPartial<Locale>
  enterMotion?: boolean
  leaveMotion?: boolean
}
