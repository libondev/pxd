import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import autoImport from 'unplugin-auto-import/vite'
import vueComponents from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import pages from 'vite-plugin-pages'
import resolver from './resolver'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_BASE_PATH,

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
        dts: true,
        resolvers: [
          resolver(),
        ],
      }),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('../src/components', import.meta.url)),
      },
    },
  }
})
