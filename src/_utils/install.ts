import type { App } from 'vue'

import type { InstallableComponent, NormalizedComponent } from '../_types'

export function withInstall (_component: NormalizedComponent): InstallableComponent {
  const component = _component as InstallableComponent

  component.install = (app: App): App => {
    app.component(component.name, component)
    return app
  }

  return component
}
