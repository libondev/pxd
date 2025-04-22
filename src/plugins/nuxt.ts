// Mandatory to avoid a bug when building
import type { } from '@nuxt/schema'
import { addComponent, defineNuxtModule } from '@nuxt/kit'

import * as components from '../components'

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
  async setup(options) {
    // if (nuxt.options.builder === '@nuxt/vite-builder') {
    //   const Tailwind = await import('@tailwindcss/vite').then(r => r.default)
    //   addVitePlugin(Tailwind())
    // }
    // else {
    //   nuxt.options.postcss.plugins['@tailwindcss/postcss'] = {}
    // }

    for (const component in components) {
      addComponent({
        name: `${options.prefix}${component}`,
        export: component,
        filePath: 'pxd',
      })
    }
  },
})
