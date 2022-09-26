import './_designs/tokens.scss'
import './_designs/themes.scss'

import type { App } from 'vue'

import { globalSymbol } from './_internal'
import type { GlobalConfig } from './_types'
import * as components from './src'

export * from './src'

export default function installCarbons (globalConfig: GlobalConfig = { size: 'medium' }) {
  return (app: App<string>): App<string> => {
    app.provide(globalSymbol, globalConfig)

    Object.values(components).forEach(component => {
      app.component(component.name, component)
    })

    return app
  }
}
