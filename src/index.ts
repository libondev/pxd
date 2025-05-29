import type { App } from 'vue'
import * as components from './components/index'

export * from './components/index'

export const version = '0.0.18'

export default function install(app: App, prefix = 'P') {
  Object.entries(components).forEach(([key, component]) => {
    app.component(`${prefix}${key}`, component)
  })
}
