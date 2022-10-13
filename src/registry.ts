/* eslint-disable simple-import-sort/imports */
import type { App, Component } from 'vue'

import { globalSymbol } from './_internal'
import type { Sizes } from './_types'

// #region
import { CButton } from './button'
import { CIcon } from './icon'
import { CInput } from './input'
import { CProvider } from './provider'
import { CDialog } from './dialog'
import { CSwitch } from './switch'
// #endregion

// #region
const components = [
  CButton,
  CIcon,
  CInput,
  CProvider,
  CDialog,
  CSwitch
] as Array<Component & { name: string }>
// #endregion

interface GlobalConfig {
  size: Sizes
}

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
