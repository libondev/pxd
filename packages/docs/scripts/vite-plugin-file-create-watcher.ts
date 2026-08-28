import type { ViteDevServer } from 'vite-plus'
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path, { sep } from 'node:path'
import process from 'node:process'
import { humanize, pascalize } from '../../../scripts/utils.js'

export function fileCreateWatcher() {
  const ignorePattern = /(-item|-group)/

  return {
    name: 'file-create-watcher',
    configureServer(server: ViteDevServer) {
      const watcher = server.watcher

      watcher.add([
        path.resolve(process.cwd(), '../../src/components'),
        path.resolve(process.cwd(), '../../src/composables'),
      ])

      watcher.on('add', (filePath: string) => {
        execSync(`pnpm -w update-exports`, { cwd: process.cwd() })

        if (filePath.endsWith('index.vue') && !ignorePattern.test(filePath)) {
          const componentName = filePath.split(sep).at(-2) || ''
          const componentNamePascal = pascalize(componentName)

          const mdFilePath = path.resolve(
            process.cwd(),
            'src',
            'pages',
            'components',
            `${componentName}.md`,
          )
          const mdFileContent = `# ${humanize(componentName)}\n\n
## Default\nNew component description.\n
\`\`\`vue demo
<template>
  <P${componentNamePascal}></P${componentNamePascal}>
</template>
\`\`\`
`
          writeFileSync(mdFilePath, mdFileContent)
        }

        const composablesDir = path.resolve(process.cwd(), '../../src/composables')
        if (
          filePath.startsWith(composablesDir) &&
          filePath.endsWith('.ts') &&
          !filePath.endsWith('index.ts')
        ) {
          const composableName = path.basename(filePath, '.ts')
          const displayName = composableName
            .replace(/^use-/, 'use')
            .replace(/-./g, (m) => m[1].toUpperCase())

          const mdFilePath = path.resolve(
            process.cwd(),
            'src',
            'pages',
            'composables',
            `${composableName}.md`,
          )
          const mdFileContent = `# ${displayName}\n\nTODO: Add description.\n\n## Exports\n\n\`\`\`ts\n// TODO: Add exports\n\`\`\`\n`
          writeFileSync(mdFilePath, mdFileContent)
        }
      })
    },
  }
}
