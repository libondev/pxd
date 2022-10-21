import type { App } from 'vue'
// #region import
import { CButton } from './button'
import { CCheckbox } from './checkbox'
import { CDialog } from './dialog'
import { CIcon } from './icon'
import { CInput } from './input'
import { CProvider } from './provider'
import { CRadio } from './radio'
import { CSpace } from './space'
import { CSpinner } from './spinner'
import { CSwitch } from './switch'
import { globalSymbol } from './_internal'
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
export * from './space'
export * from './checkbox'
export * from './radio'
// #endregion export

export { default as PxResolver } from './resolver'

export interface GlobalConfig {
  size: import('./_types/props').Sizes
}

export default function install (
  app: App,
  globalConfig: GlobalConfig = { size: 'medium' }
): App {
  app.provide(globalSymbol, globalConfig)

  const components = [
    // #region registry
    CButton,
    CIcon,
    CInput,
    CProvider,
    CDialog,
    CSpinner,
    CSwitch,
    CSpace,
    CCheckbox,
    CRadio
    // #endregion registry
  ]

  components.forEach(component => {
    component.install(app)
  })

  return app
}
