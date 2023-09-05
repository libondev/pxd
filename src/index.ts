import type { App } from 'vue'

import Button from './components/button'
import Switch from './components/switch'

export {
  Button,
  Switch
}

const COMPONENTS = [
  Button,
  Switch,
]

export default function (Vue: App) {
  COMPONENTS.forEach((component) => {
    Vue.component(component.name, component)
  })
}
