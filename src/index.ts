import type { App } from 'vue'
// #region import
import { PxButton } from './button'
import { PxCheckbox } from './checkbox'
import { PxDialog } from './dialog'
import { PxIcon } from './icon'
import { PxInput } from './input'
import { PxProvider } from './provider'
import { PxRadio } from './radio'
import { PxSpace } from './space'
import { PxSpinner } from './spinner'
import { PxSwitch } from './switch'
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
    PxButton,
    PxIcon,
    PxInput,
    PxProvider,
    PxDialog,
    PxSpinner,
    PxSwitch,
    PxSpace,
    PxCheckbox,
    PxRadio
    // #endregion registry
  ]

  components.forEach(component => {
    component.install(app)
  })

  return app
}
