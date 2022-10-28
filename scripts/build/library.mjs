import AutoImports from 'unplugin-auto-import/vite'
import Dts from 'vite-plugin-dts'
import SetupName from 'unplugin-vue-setup-extend-plus/vite'
import Vue from '@vitejs/plugin-vue'

/** @type {import('vite').UserConfigExport} */
export default ({ mode }) => {
  return {
    build: {
      minify: true,
      outDir: './dist',
      target: 'modules',
      lib: {
        entry: './src/index.ts',
        formats: ['es'],
        fileName: '[name]'
      },
      rollupOptions: {
        external: [/\.scss/, 'vue', '@vueuse/core'],
        output: {
          exports: 'named',
          preserveModules: true,
          preserveModulesRoot: 'src'
        }
      }
    },
    plugins: [
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
        outputDir: './dist',
        exclude: ['**/constraints.ts']
      })
    ]
  }
}
