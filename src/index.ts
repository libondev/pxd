import type { App } from 'vue'

import Button from './components/button'
import Switch from './components/switch'
import Checkbox from './components/checkbox'

export {
  Button,
  Switch,
  Checkbox
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
