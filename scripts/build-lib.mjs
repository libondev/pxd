import AutoImports from 'unplugin-auto-import/vite'
import Dts from 'vite-plugin-dts'
import SetupName from 'unplugin-vue-setup-extend-plus/vite'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
// import jsx from '@vitejs/plugin-vue-jsx'

export default defineConfig(({ mode }) => {
  return {
    build: {
      minify: true,
      outDir: './dist',
      lib: {
        entry: './src/index.ts',
        formats: ['es'],
        fileName: '[name]'
      },
      rollupOptions: {
        external: [/\.scss/, 'vue', '@vueuse/core'],
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src'
        }
      }
    },
    plugins: [
      // jsx(),
      Vue(),
      SetupName(),
      AutoImports({
        dts: false,
        imports: ['vue'],
        dirs: ['src/**/*.vue']
      }),
      // build dts on production
      mode === 'production' && Dts({
        staticImport: true,
        entryRoot: './src',
        outputDir: './dist'
      })
    ]
  }
})
