import type { App } from 'vue'
import * as components from './components/index.js'

export { version } from '../package.json'

export * from './components/index.js'
export * from './composables/index.js'

export type * from './types/shared/props'
export type * from './types/shared/utils'

export default function install(app: App, prefix = 'P') {
  Object.entries(components).forEach(([key, component]) => {
    app.component(`${prefix}${key}`, component)
  })
}
