import path from 'node:path'
import { definePlugin, defineRule } from 'vite-plus/lint/plugins'
import { applyVueScriptFixes } from './vue-script-fixes.js'

const vueSetupApiOrder = defineRule({
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'Enforce the declaration order inside Vue <script setup>.',
    },
    messages: {
      order:
        'Vue <script setup> declarations must follow: imports -> props/emits -> consts -> ref/computed -> composables -> functions -> watch/provider -> lifecycles -> defineExpose.',
    },
  },
  create(context) {
    return {
      Program(node) {
        const relativeFilename = path.relative(context.cwd, context.filename).replaceAll('\\', '/')

        if (!relativeFilename.endsWith('.vue') || !relativeFilename.startsWith('src/')) {
          return
        }

        const script = context.sourceCode.text
        let result

        try {
          result = applyVueScriptFixes(script, context.filename)
        } catch {
          return
        }

        if (!result.orderChanged) {
          return
        }

        context.report({
          node,
          messageId: 'order',
          fix(fixer) {
            return fixer.replaceTextRange([0, script.length], result.content)
          },
        })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'pxd' },
  rules: {
    'vue-setup-api-order': vueSetupApiOrder,
  },
})
