import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import gdsiResolver from 'gdsi/resolver'
import anchor from 'markdown-it-anchor'
import attrs from 'markdown-it-attrs'
import {
  container,
  noticeboard,
} from 'markdown-it-plugins'
import prism from 'markdown-it-prism'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import router from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import markdown from 'vite-vue-md'
import { fileCreateWatcher } from './scripts/vite-plugin-file-create-watcher.js'

const codeHighlighter = await createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  themes: [
    import('@shikijs/themes/github-dark'),
    import('@shikijs/themes/github-light'),
  ],
  langs: [
    import('@shikijs/langs/vue'),
  ],
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      router({
        dts: './shims/typed-router.d.ts',
        extensions: ['.vue', '.md'],
      }),
      vue({
        include: [/\.vue$/, /\.md$/],
      }),
      vueJsx(),
      tailwindcss(),
      components({
        dts: './shims/components.d.ts',
        extensions: ['vue', 'md'],
        include: [/\.vue$/, /\.vue\?vue/, /\.vue\.[tj]sx?\?vue/, /\.md$/],
        resolvers: [
          gdsiResolver({
            type: 'vue',
            prefix: 'Icon',
          }),
        ],
      }),
      autoImport({
        dts: './shims/auto-imports.d.ts',
        extensions: ['vue', 'md'],
        dirs: ['./src/components', './src/pages'],
        include: [/\.vue$/, /\.vue\?vue/, /\.vue\.[tj]sx?\?vue/, /\.md$/],
        imports: [
          'vue',
          VueRouterAutoImports,
        ],
      }),
      markdown({
        markdownItOptions: {
          html: true,
          linkify: true,
          typographer: true,
        },
        async markdownItSetup(md) {
          md.use(prism)
          md.use(attrs)
          md.use(anchor)
          md.use(container)
          md.use(noticeboard)
        },
        onDemo(component, code) {
          this.registerComponent('CodeBlock', '@/components/CodeBlock.vue')

          const highlightedCode = codeHighlighter.codeToHtml(code, {
            lang: 'vue',
            themes: {
              light: 'github-light',
              dark: 'github-dark',
            },
          })

          return `<CodeBlock>
            ${component}
            <template #code>${highlightedCode}</template>
          </CodeBlock>`
        },
      }),
      mode === 'development' && fileCreateWatcher(),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    optimizeDeps: {
      include: ['gdsi/vue', 'tailwind-merge', '@vue/shared'],
    },
  }
})
