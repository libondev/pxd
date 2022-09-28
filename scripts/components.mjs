import jsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  return {
    include: ['src'],
    build: {
      minify: true,
      target: 'es2018',
      lib: {
        formats: ['es'],
        fileName: '[name]',
        entry: resolve(process.cwd(), 'components/index.ts')
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          name: 'es',
          preserveModules: true,
          preserveModulesRoot: resolve(process.cwd(), 'dist/')
        }
      }
    },
    plugins: [
      jsx(),
      mode === 'production' && dts({ exclude: ['node_modules', 'playground', 'env.d.ts'] })
    ]
  }
})
