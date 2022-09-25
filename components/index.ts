import './_designs/tokens.css'
import './_designs/themes.css'

import type { App } from 'vue'

import { globalSymbol } from './_internal/injectKeys'
import type { GlobalConfig } from './_types'
import * as components from './components'

export * from './components'

export default function install (app: App, globalConfig: GlobalConfig = { size: 'medium' }): App {
  app.provide(globalSymbol, globalConfig)

  Object.keys(components).forEach((key) => {
    // @ts-expect-error
    app.component(key, components[key])
  })

  return app
}
