import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import GdsiResolver from 'gdsi/resolver'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import router from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import PxdResolver from '../../src/plugins/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    router({
      dts: './shims/typed-router.d.ts',
    }),
    vue(),
    vueJsx(),
    tailwindcss(),
    components({
      dts: './shims/components.d.ts',
      resolvers: [
        PxdResolver(),
        GdsiResolver({
          type: 'vue',
          prefix: 'Icon',
        }),
      ],
    }),
    autoImport({
      dts: './shims/auto-imports.d.ts',
      imports: [
        'vue',
        VueRouterAutoImports,
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
