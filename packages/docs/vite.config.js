import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import gdsiResolver from 'gdsi/resolver'
import {
  codeLineNumbers,
  collectBlockCode,
  container,
  noticeboard,
} from 'markdown-it-plugins'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import router from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import markdown from 'vite-plugin-md'
import pxdResolver from '../../src/plugins/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    router({
      dts: './shims/typed-router.d.ts',
      extensions: ['.vue', '.md'],
    }),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    markdown({
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      markdownItSetup(md) {
        md.use(container)
        md.use(noticeboard)
        md.use(codeLineNumbers)
        md.use(collectBlockCode)
      },
    }),
    vueJsx(),
    tailwindcss(),
    components({
      dts: './shims/components.d.ts',
      resolvers: [
        pxdResolver(),
        gdsiResolver({
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

  optimizeDeps: {
    include: ['gdsi/vue', 'tailwind-merge', '@vue/shared'],
  },
})
