import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import glob from 'fast-glob'
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url'
import unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
// import VueComponents from 'unplugin-vue-components/vite'
// import resolver from 'src/plugins/resolver'

const GLOB_ENTRY = [
  'src/components/**/*.ts',
  'src/composables/**/*.ts',
  'src/plugins/**/*.ts'
]

export default defineConfig({
  base: './',

  build: {
    minify: true,
    outDir: './dist',
    target: 'modules',
    cssMinify: 'lightningcss',
    reportCompressedSize: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      external: ['vue', 'unocss', 'radix-vue'],
      input: {
        'index': fileURLToPath(new URL(`src/index.ts`, import.meta.url)),
        'styles': fileURLToPath(new URL(`src/styles.ts`, import.meta.url)),

        ...Object.fromEntries(
          glob.sync(GLOB_ENTRY).map(file => {
            return [
              path.relative('src', file.slice(0, file.length - path.extname(file).length)),
              fileURLToPath(new URL(file, import.meta.url))
            ]
          })
        )
      },
      output: {
        format: 'es',
        dir: 'dist',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]', // css
      },
    }
  },

  esbuild: {
    target: 'esnext',
    drop: ['console', 'debugger']
  },

  css: {
    devSourcemap: true,
    transformer: 'lightningcss'
  },

  plugins: [
    dts(),
    unocss(),
    vueJsx(),
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),

    autoImport({
      dts: './shims/auto-imports.d.ts',
      imports: ['vue'],
      dirs: [
        './src/composables'
      ],
      vueTemplate: true,
      eslintrc: {
        enabled: true,
        globalsPropValue: true,
        filepath: './shims/eslintrc-auto-import.json',
      }
    })

    // VueComponents({
    //   resolvers: [
    //     resolver()
    //   ]
    // })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
