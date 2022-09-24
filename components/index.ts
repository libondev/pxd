import type { App } from 'vue'
import { COMPONENT_PREFIX } from './constants'

import * as components from './components'

export * from './components'

export default function install (app: App): void {
  Object.keys(components).forEach((key) => {
    // @ts-expect-error
    app.component(COMPONENT_PREFIX + key, components[key])
  })
}
