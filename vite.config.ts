import type { PreRenderedChunk } from 'rollup'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import glob from 'fast-glob'
import autoImport from 'unplugin-auto-import/vite'
import { transformLazyShow } from 'v-lazy-show'
import { defineConfig, type UserConfig } from 'vite'
import dts from 'vite-plugin-dts'

const buildConfig: UserConfig['build'] = {
  minify: true,
  outDir: './dist',
  target: 'modules',
  // cssMinify: 'lightningcss',
  reportCompressedSize: false,
  rollupOptions: {
    preserveEntrySignatures: 'strict',
    external: ['vue', 'radix-vue'],
    input: {
      vars: fileURLToPath(new URL(`src/styles/vars.css`, import.meta.url)),

      ...Object.fromEntries(
        glob.sync([
          'src/components/**/*.ts',
          'src/composables/**/*.ts',
          'src/plugins/**/*.ts',
          'src/_utils/**/*.ts',
        ]).map((file) => {
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
      entryFileNames: '[name].js',
      assetFileNames: '[name][extname]', // css
      chunkFileNames: (chunk: PreRenderedChunk) => {
        if (chunk.moduleIds[0].includes('icons')) {
          return 'components/_icons/[name].js'
        }

        return `${chunk.name}.js`
      },
    },
  },
}

const esbuildConfig: UserConfig['esbuild'] = {
  target: 'esnext',
  drop: ['console', 'debugger'],
}

export const pluginsConfig: UserConfig['plugins'] = [
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
]

export const resolveConfig: UserConfig['resolve'] = {
  alias: {
    '#': fileURLToPath(new URL('./src', import.meta.url)),
    '#utils': fileURLToPath(new URL('./src/components/_utils', import.meta.url)),
  },
}

export default defineConfig({
  base: './',

  build: buildConfig,

  esbuild: esbuildConfig,

  plugins: [
    ...pluginsConfig,
    dts({
      entryRoot: 'src',
      cleanVueFileName: true,
      exclude: ['src/main.ts'],
    }),
  ],

  resolve: resolveConfig,
})
