import type { App } from 'vue'
import * as components from './components/index'

export * from './components/index'

export default function install(app: App) {
  Object.entries(components).forEach(([key, component]) => {
    app.component(key, component)
  })
}
