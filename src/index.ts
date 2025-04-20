import type { App } from 'vue'
import Button from './components/button/index.vue'
import ConfigProvider from './components/config-provider/index.vue'

const components = [Button, ConfigProvider]
export default function install(app: App) {
  components.forEach((component) => {
    app.component(component.name!, component)
  })
}

export {
  Button,
  ConfigProvider,
}
