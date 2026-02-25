import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { globSync } from 'tinyglobby'

import { pascalize } from './utils.js'

const ROOT = process.cwd()
const TYPE_PATH = path.resolve(ROOT, 'volar.d.ts')
const componentsPath = globSync('./src/components/*/index.vue', { cwd: ROOT })

/**
 * @param {string[]} lines
 * @returns {string} 模板内容
 */
function getFileTemplate(lines) {
  return `/* prettier-ignore */
// @ts-nocheck
export { }
declare module 'vue' {
  export interface GlobalComponents {
    ${lines.join('\n    ')}
  }
}
`
}

function processComponentsPath() {
  const exports = componentsPath.map((p) => {
    const path = p.replace(/src/, 'pxd').replace(/\/index\.vue/, '')
    const [, name] = path.match(/.*\/components\/(.*)/)

    return `P${pascalize(name)}: (typeof import('${path}'))['default']`
  })

  return exports
}

async function run() {
  const fileContent = getFileTemplate(processComponentsPath())

  await writeFile(TYPE_PATH, fileContent, 'utf-8')
}

run()
