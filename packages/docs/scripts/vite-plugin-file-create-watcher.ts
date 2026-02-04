import type { ViteDevServer } from 'vite'

import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path, { sep } from 'node:path'
import process from 'node:process'

import { humanize, pascalize } from '../../../scripts/utils.js'

export function fileCreateWatcher() {
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

        if (filePath.endsWith('index.vue')) {
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
## Default\n
\`\`\`vue demo
<template>
  <P${componentNamePascal}></P${componentNamePascal}>
</template>
\`\`\`
`
          writeFileSync(mdFilePath, mdFileContent)
        }
      })
    },
  }
}
