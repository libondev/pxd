import VueComponents from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import resolver from './src/plugins/resolver'

import { pluginsConfig, resolveConfig } from './vite.config'

export default defineConfig({
  base: './',

  esbuild: {
    target: 'esnext',
  },

  css: {
    devSourcemap: true,
  },

  plugins: [
    ...pluginsConfig as any,

    VueComponents({
      dts: './shims/components.d.ts',
      resolvers: [
        resolver(),
      ],
    }),
  ],

  resolve: resolveConfig,
})
