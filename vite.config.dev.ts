import { URL, fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import autoImport from 'unplugin-auto-import/vite'
import VueComponents from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import resolver from './src/plugins/resolver'

export default defineConfig({
  base: './',

  esbuild: {
    target: 'esnext',
  },

  css: {
    devSourcemap: true,
    // transformer: 'lightningcss',
  },

  plugins: [
    vueJsx(),
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),

    autoImport({
      dts: './shims/auto-imports.d.ts',
      imports: ['vue'],
      dirs: [
        './src/composables',
      ],
      vueTemplate: true,
      eslintrc: {
        enabled: true,
        globalsPropValue: true,
        filepath: './shims/eslintrc-auto-import.json',
      },
    }),

    VueComponents({
      dts: './shims/components.d.ts',
      resolvers: [
        resolver(),
      ],
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
