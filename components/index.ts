import './_designs/tokens.css'
import './_designs/themes.css'

import type { App } from 'vue'

import { globalSymbol } from './_internal/injectKeys'
import type { GlobalConfig } from './_types'
import * as components from './components'

export * from './components'

export default function (globalConfig: GlobalConfig = { size: 'medium' }) {
  return function install (app: App<string>): App<string> {
    app.provide(globalSymbol, globalConfig)

    Object.keys(components).forEach((key) => {
      // @ts-expect-error
      app.component(key, components[key])
    })
    return app
  }
}
