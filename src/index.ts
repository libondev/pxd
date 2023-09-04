import type { App } from 'vue'

import Switch from './components/switch/src/switch.vue'

export {
  Switch
}

const COMPONENTS = [
  Switch
]

export default function installer(Vue: App) {
  COMPONENTS.forEach((component) => {
    Vue.component(component.name, component)
  })
}
