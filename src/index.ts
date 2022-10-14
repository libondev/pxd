/* eslint-disable simple-import-sort/imports */
/* eslint-disable simple-import-sort/exports */
import type { App as Vue } from 'vue'

import { globalSymbol } from './_internal'

// #region import
import { CButton } from './button'
import { CDialog } from './dialog'
import { CIcon } from './icon'
import { CInput } from './input'
import { CProvider } from './provider'
import { CSpinner } from './spinner'
import { CSwitch } from './switch'
// #endregion import

// #region export
export * from './_types'
export * from './button'
export * from './dialog'
export * from './icon'
export * from './input'
export * from './provider'
export * from './spinner'
export * from './switch'
// #endregion export

export interface GlobalConfig {
  size: import('./_types/props').Sizes
}

export default function installCarbons<App extends Vue<string>> (
  globalConfig?: GlobalConfig
): (app: App) => App {
  const components = [
    // #region registry
    CButton,
    CIcon,
    CInput,
    CProvider,
    CDialog,
    CSpinner,
    CSwitch
    // #endregion registry
  ]

  return (app: App): App => {
    app.provide(globalSymbol, Object.assign({ size: 'medium' }, globalConfig))

    components.forEach(component => {
      component.install(app)
    })

    return app
  }
}
