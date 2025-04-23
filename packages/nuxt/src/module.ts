import { addComponent, defineNuxtModule } from '@nuxt/kit'
import * as components from 'pxd/components'

export interface ModuleOptions {
  prefix: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'pxd',
    configKey: 'pxd',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    prefix: 'P',
  },
  async setup(options: ModuleOptions) {
    // 仅用于测试
    console.warn('PXD Module loaded successfully!')

    for (const component in components) {
      addComponent({
        name: `${options.prefix}${component}`,
        export: component,
        filePath: 'pxd',
      })
    }
  },
})
