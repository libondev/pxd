import type { App } from 'vue'
import * as components from './components/index'

export * from './components/index.js'
export * from './composables/index.js'

export const version = '0.0.34'

export default function install(app: App, prefix = 'P') {
  Object.entries(components).forEach(([key, component]) => {
    app.component(`${prefix}${key}`, component)
  })
}
