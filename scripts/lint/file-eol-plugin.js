import path from 'node:path'
import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

const CRLF_EXTENSIONS = new Set(['.bat', '.ps1'])

function normalizeEol(content, expectedEol) {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').join(expectedEol)
}

const fileEol = defineRule({
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description: 'Enforce the repository line-ending convention.',
    },
    messages: {
      eol: 'File must use {{eol}} line endings.',
    },
  },
  create(context) {
    return {
      Program(node) {
        if (context.filename.endsWith('.vue')) {
          return
        }

        const text = context.sourceCode.text
        const expectedEol = CRLF_EXTENSIONS.has(path.extname(context.filename).toLowerCase())
          ? '\r\n'
          : '\n'
        const normalized = normalizeEol(text, expectedEol)

        if (normalized === text) {
          return
        }

        context.report({
          node,
          messageId: 'eol',
          data: { eol: expectedEol === '\r\n' ? 'CRLF' : 'LF' },
          fix(fixer) {
            return fixer.replaceTextRange([0, text.length], normalized)
          },
        })
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'pxd' },
  rules: {
    'file-eol': fileEol,
  },
})
