import type { PreRenderedChunk } from 'rollup'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import glob from 'fast-glob'
import autoImport from 'unplugin-auto-import/vite'
import { transformLazyShow } from 'v-lazy-show'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  base: './',

  build: {
    minify: true,
    outDir: './dist',
    target: 'modules',
    reportCompressedSize: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      external: ['vue', 'radix-vue'],
      input: {
        vars: fileURLToPath(new URL(`src/styles/vars.css`, import.meta.url)),

        ...Object.fromEntries(
          glob.sync([
            'src/components/**/*.ts',
            'src/plugins/**/*.ts',
          ]).map(file => [
            path.relative('src', file.slice(0, file.length - path.extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url)),
          ]),
        ),
      },
      output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]', // css
        chunkFileNames: (chunk: PreRenderedChunk) => {
          const _path = chunk.moduleIds[0]

          if (_path.includes('icons/')) {
            const [_name] = _path.split('/').slice(-1)
            return `components/_icons/${_name}`
          }
          else if (_path.includes('src/components/')) {
            const [_name] = chunk.name.split('.')
            return `components/${_name}/_.js`
          }

          return `${chunk.name}.js`
        },
      },
    },
  },

  esbuild: {
    target: 'esnext',
    drop: ['console', 'debugger'],
  },

  plugins: [
    vueJsx(),
    vue({
      // script: {
      //   defineModel: true,
      //   propsDestructure: true,
      // },
      template: {
        compilerOptions: {
          nodeTransforms: [transformLazyShow],
        },
      },
    }),
    autoImport({
      dts: './shims/auto-imports.d.ts',
      imports: [
        'vue',
        {
          // 'tailwind-merge': [['twMerge', 'merge']],
        },
      ],
      dirs: [],
      vueTemplate: true,
      eslintrc: {
        enabled: true,
        globalsPropValue: true,
        filepath: './shims/eslintrc-auto-import.json',
      },
    }),
    dts({
      entryRoot: 'src',
      cleanVueFileName: true,
      exclude: ['src/main.ts'],
    }),
  ],

  resolve: {
    alias: {
      '#': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./src/components/', import.meta.url)),
      '#utils': fileURLToPath(new URL('./src/components/_utils', import.meta.url)),
    },
  },
})
