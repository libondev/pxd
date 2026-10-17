import path from 'node:path'
import { definePlugin, defineRule } from 'vite-plus/lint/plugins'
import { applyImportJsSuffixFixes, applyVueScriptFixes } from './vue-script-fixes.js'

function isTargetFile(filename) {
  const relativeFilename = path.relative(process.cwd(), filename).replaceAll('\\', '/')

  return (
    relativeFilename.startsWith('src/') &&
    /\.(js|jsx|mjs|cjs|mts|cts|ts|tsx|vue)$/.test(relativeFilename) &&
    !/\.d\.(ts|mts|cts)$/.test(relativeFilename)
  )
}

const importJsSuffix = defineRule({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Require runtime extensions on relative source imports and exports.',
    },
    messages: {
      missingSuffix: "Relative imports and exports targeting TypeScript files must end with '.js'.",
    },
  },
  create(context) {
    return {
      Program(node) {
        if (!isTargetFile(context.filename)) {
          return
        }

        const script = context.sourceCode.text
        let changed = false
        let replacement = script

        try {
          if (context.filename.endsWith('.vue')) {
            const result = applyVueScriptFixes(script, context.filename)
            changed = result.suffixChanged
            replacement = result.content
          } else {
            const result = applyImportJsSuffixFixes(script, context.filename)
            changed = result.changed
            replacement = result.content
          }
        } catch {
          return
        }

        if (!changed) {
          return
        }

        context.report({
          node,
          messageId: 'missingSuffix',
          fix(fixer) {
            return fixer.replaceTextRange([0, script.length], replacement)
          },
        })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'pxd' },
  rules: {
    'import-js-suffix': importJsSuffix,
  },
})
