import { URL, fileURLToPath } from 'node:url'

import Components from 'unplugin-vue-components/vite'
import Inspect from 'vite-plugin-inspect'
import Pages from 'vite-plugin-pages'
import PxResolver from './pxd/resolver'
import { defineConfig } from 'vite'
import exportName from 'unplugin-vue-setup-extend-plus/vite'
import imports from 'unplugin-auto-import/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    vue(),
    exportName(),
    vueJsx(),
    imports({
      imports: ['vue']
    }),
    Pages({
      extensions: ['vue', 'jsx', 'md'],
    }),
    Components({
      resolvers: [PxResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'pxd': fileURLToPath(new URL('./pxd', import.meta.url))
    }
  }
})
