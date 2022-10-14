import type { App, Component } from 'vue'

export type NormalizedComponent = Component & {
  name: string
}

export type InstallableComponent = NormalizedComponent & {
  install: (app: App) => App
}
