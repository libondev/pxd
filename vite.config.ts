import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import glob from 'fast-glob'
import autoImport from 'unplugin-auto-import/vite'
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
      chunkFileNames: '[name].js',
      entryFileNames: '[name].js',
      assetFileNames: '[name][extname]', // css
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
    script: {
      defineModel: true,
      propsDestructure: true,
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
    dirs: [
      './src/composables',
      './src/_internal',
      './src/_utils',
    ],
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
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    '@utils': fileURLToPath(new URL('./src/_utils', import.meta.url)),
    '@internal': fileURLToPath(new URL('./src/_internal', import.meta.url)),
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
