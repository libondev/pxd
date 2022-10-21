import { URL, fileURLToPath } from 'node:url'

import Inspect from 'vite-plugin-inspect'
// import Components from 'unplugin-vue-components/vite'
// import CarbonsResolver from '../src/resolver'
import Pages from 'vite-plugin-pages'
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
    // Components({
    //   // resolvers: [CarbonsResolver()]
    // })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
