import { fileURLToPath, URL } from 'node:url'

import gdsiResolver from '@gdsicon/vue/resolver'
import { fromHighlighter } from '@shikijs/markdown-it/core'
import slugify from '@sindresorhus/slugify'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import anchor from 'markdown-it-anchor'
import attrs from 'markdown-it-attrs'
import {
  container,
  noticeboard,
} from 'markdown-it-plugins'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import router from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import layouts from 'vite-plugin-vue-meta-layouts'
import markdown from 'vite-vue-md'
import pxdResolver from '../../src/plugins/resolver'
import { fileCreateWatcher } from './scripts/vite-plugin-file-create-watcher.js'

const codeThemes = {
  dark: 'github-dark',
  light: 'github-light',
}

const codeHighlighter = await createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  themes: [
    import(`@shikijs/themes/${codeThemes.dark}`),
    import(`@shikijs/themes/${codeThemes.light}`),
  ],
  langs: [
    import('@shikijs/langs/vue'),
    import('@shikijs/langs/javascript'),
    import('@shikijs/langs/bash'),
  ],
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      reportCompressedSize: false,
    },

    plugins: [
      layouts({
        target: './src/layouts',
        defaultLayout: 'default',
      }),
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
          gdsiResolver({ prefix: 'Icon' }),
          pxdResolver(),
        ],
      }),
      autoImport({
        dts: './shims/auto-imports.d.ts',
        dirs: ['./src/components', './src/pages'],
        include: [/\.vue$/, /\.vue\?vue/, /\.vue\.[tj]sx?\?vue/, /\.md$/],
        imports: [
          'vue',
          VueRouterAutoImports,
        ],
      }) as any,
      markdown({
        markdownItOptions: {
          html: true,
          linkify: true,
          typographer: true,
          quotes: '""\'\'',
        },
        async markdownItSetup(md) {
          md.use(attrs)
          md.use(anchor, {
            slugify: s => slugify(s),
            permalink: anchor.permalink.headerLink(),
          })
          md.use(container)
          md.use(noticeboard)
          md.use(fromHighlighter(codeHighlighter, {
            themes: codeThemes,
          }))
        },
        onDemo(component, code) {
          this.registerComponent('CodeBlock', '@/components/CodeBlock.vue')

          const highlightedCode = codeHighlighter.codeToHtml(code, {
            lang: 'vue',
            themes: codeThemes,
          })
            .replace(/\{\{(.*?)\}\}/g, '&lbrace;&lbrace;$1&rbrace;&rbrace;')
            .replace('tabindex="0"', 'translate="no"')

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
      include: ['@vue/shared', 'canvas-confetti', '@unhead/vue'],
    },

    server: {
      host: '0.0.0.0',
    },
  }
})
