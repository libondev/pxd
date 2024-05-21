import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import glob from 'fast-glob'
import unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const GLOB_ENTRY = [
  'src/components/**/*.ts',
  'src/composables/**/*.ts',
  'src/plugins/**/*.ts',
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
      external: ['vue', 'radix-vue'],
      input: {
        vars: fileURLToPath(new URL(`src/styles/vars.css`, import.meta.url)),

        ...Object.fromEntries(
          glob.sync(GLOB_ENTRY).map((file) => {
            return [
              path.relative('src', file.slice(0, file.length - path.extname(file).length)),
              fileURLToPath(new URL(file, import.meta.url)),
            ]
          }),
        ),
      },
      output: {
        dir: 'dist',
        format: 'es',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]', // css
      },
    },
  },

  esbuild: {
    target: 'esnext',
    drop: ['console', 'debugger'],
  },

  css: {
    devSourcemap: true,
    transformer: 'lightningcss',
  },

  plugins: [
    unocss(),
    vueJsx(),
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),

    dts({
      cleanVueFileName: true,
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
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
