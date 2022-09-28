import type { GlobalConfig } from '@types'
import type { App, Component } from 'vue'

import { globalSymbol } from './_internal'
// #region
import { CButton } from './button'
import { CIcon } from './icon'
import { CInput } from './input'
import { CProvider } from './provider'
// #endregion

// #region
const components = [
  CButton,
  CIcon,
  CInput,
  CProvider
] as Array<Component & { name: string }>
// #endregion

export function installCarbons (
  globalConfig: GlobalConfig = { size: 'medium' }
) {
  return (app: App<string>): App<string> => {
    app.provide(globalSymbol, globalConfig)

    components.forEach(component => {
      app.component(component.name, component)
    })

    return app
  }
}
