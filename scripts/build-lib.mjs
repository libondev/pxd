import jsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import process from 'process'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const outDir = resolve(process.cwd(), 'dist/')

export default defineConfig(({ mode }) => {
  console.log({ mode })
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
      // build dts on production
      mode === 'development' && dts({
        entryRoot: './src',
        outputDir: './dist',
        staticImport: true
      })
    ]
  }
})
