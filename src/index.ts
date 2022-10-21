import type { App, Plugin } from 'vue'

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

export { default as PxdResolver } from './resolver'

export interface GlobalConfig {
  size: import('./_types/props').Sizes
}

export const installer: Plugin = (
  app: App<Element>,
  configs: GlobalConfig
) => {
  app.provide(globalSymbol, Object.assign({ size: 'medium' }, configs));

  [
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
  ].forEach(component => app.use(component))

  return app
}
