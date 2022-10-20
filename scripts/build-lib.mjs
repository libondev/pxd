import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import imports from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const outDir = resolve(cwd(), 'dist/')

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: './dist',
      lib: {
        entry: './src/index.ts',
        formats: ['es'],
        fileName: '[name]'
      },
      rollupOptions: {
        external: ['vue', '@vueuse/core'],
        output: {
          name: 'es',
          dir: outDir,
          preserveModules: true,
          preserveModulesRoot: outDir
        }
      }
    },
    plugins: [
      jsx(),
      vue(),
      imports({
        imports: ['vue'],
        dirs: ['src/**/*.tsx'],
        dts: './src/_types/imports.d.ts',
        eslintrc: {
          enabled: true
        }
      }),
      // build dts on production
      mode === 'production' && dts({
        entryRoot: './src',
        outputDir: './dist',
        staticImport: true
      })
    ]
  }
})
