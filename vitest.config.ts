import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    vue(),
  ],
  test: {
    globals: false,
    fileParallelism: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    // setupFiles: './vitest.setup.ts',
    server: {
      deps: {
        inline: [/@gdsicon\/vue/],
      },
    },
    deps: {
      optimizer: {
        web: {
          enabled: false,
        },
      },
    },
    pool: 'vmThreads',
  },
})
