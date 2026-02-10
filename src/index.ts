import type { App } from 'vue'

import * as components from './components/index'

export { version } from '../package.json'

export * from './components/index.js'
export * from './composables/index.js'

export type * from './types/shared'

export default function install(app: App, prefix = 'P') {
  Object.entries(components).forEach(([key, component]) => {
    app.component(`${prefix}${key}`, component)
  })
}
