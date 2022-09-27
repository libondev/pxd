import './_designs/tokens.scss'
import './_designs/themes.scss'

import type { GlobalConfig } from '@types'
import type { App } from 'vue'

import { globalSymbol } from '@/_internal'

import * as components from './components'

export * from './components'

export default function installCarbons (
  globalConfig: GlobalConfig = { size: 'medium' }
) {
  return (app: App<string>): App<string> => {
    app.provide(globalSymbol, globalConfig)

    Object.values(components).forEach(component => {
      app.component(component.name, component)
    })

    return app
  }
}
