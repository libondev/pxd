import { cwd } from 'node:process'
import { defineConfig } from 'vite'
import defineName from 'unplugin-vue-setup-extend-plus/vite'
import dts from 'vite-plugin-dts'
import imports from 'unplugin-auto-import/vite'
// import jsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'

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
      // jsx(),
      vue(),
      defineName(),
      imports({
        dts: false,
        imports: ['vue'],
        dirs: ['src/**/*.vue']
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
