import type { ConfigProviderProps } from '../components/config-provider/types'
import type { Locale } from '../locales'
import enUS from '../locales/en-us.js'
import { createContext } from '../utils/context.js'

const configProviderKey = 'ConfigProvider'

export interface ConfigProviderContext extends Omit<Required<ConfigProviderProps>, 'locale'> {
  locale: Locale
}

export const [provideConfigProvider, useConfigProvider] = createContext<ConfigProviderContext>(
  configProviderKey,
  {
    size: 'md',
    locale: enUS,
    enterMotion: true,
    leaveMotion: true,
  },
)
