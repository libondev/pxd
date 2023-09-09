import type { App } from 'vue'

import Button from './components/button'
import Switch from './components/switch'
import Checkbox from './components/checkbox'
import Dialog from './components/dialog'

export {
  Button,
  Switch,
  Checkbox,
  Dialog
}

const COMPONENTS = [
  Button,
  Switch,
  Checkbox,
  Dialog
]

export default function (Vue: App) {
  COMPONENTS.forEach((component) => {
    Vue.component(component.name, component)
  })
}
