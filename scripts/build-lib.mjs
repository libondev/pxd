import jsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import process from 'process'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const outDir = resolve(process.cwd(), 'dist/')

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: '[name]'
    },
    rollupOptions: {
      external: ['vue'],
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
    dts({
      entryRoot: './src',
      outputDir: './dist',
      staticImport: true
    })
  ]
})
