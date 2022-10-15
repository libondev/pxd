import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import Components from 'unplugin-vue-components/vite'
// import CarbonsResolver from '../src/resolver'
import Pages from 'vite-plugin-pages'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
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
