import type { ConfigProviderProps } from '../components/config-provider/types'

import enUS from '../locales/en-us'
import { createContext } from '../utils/context'

export const injectionKey = 'ConfigProvider'

export const [provideConfigProvider, useConfigProvider] = createContext<
  Required<ConfigProviderProps>
>(injectionKey, {
  size: 'md',
  locale: enUS,
  popoverShowTransition: true,
})
