import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import autoImport from 'unplugin-auto-import/vite'
import vueComponents from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import pages from 'vite-plugin-pages'

import pxdResolver from '../src/plugins/resolver'

// https://vite.dev/config/
export default defineConfig({
  base: './',

  esbuild: {
    target: 'esnext',
  },

  css: {
    devSourcemap: true,
  },

  plugins: [
    pages({
      dirs: [
        { dir: 'src/views', baseRoute: '' },
      ],
    }),

    vue(),

    autoImport({
      imports: [
        'vue',
      ],
      dirs: [],
      vueTemplate: true,
      eslintrc: {
        enabled: true,
        globalsPropValue: true,
        filepath: './eslintrc-auto-import.json',
      },
    }),

    vueComponents({
      resolvers: [
        pxdResolver(),
      ],
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('../src/components', import.meta.url)),
    },
  },
})
