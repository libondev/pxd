#!/usr/bin/env zx

import { bgGreen, bgRed } from 'kolorist'
import MagicString from 'magic-string'
import process from 'node:process'
import { $, cd, fs } from 'zx'

$.quiet = true

function capitalize (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function toPascalCase (string) {
  return string.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

function toCamelCase (string) {
  return capitalize(toPascalCase(string))
}

const [,,, componentName] = process.argv

if (!/[a-zA-Z]+/.test(componentName)) {
  console.log(bgRed(` Invalid component name:【${componentName}】 `))
  process.exit(1)
}

cd('./src')

const camelCase = toCamelCase(componentName)
const camelCaseWithPrefix = `C${camelCase}`

const COMPONENT_TSX = `import type { PropType } from 'vue'
import { defineComponent } from 'vue'

import { createClassName, withInstall } from '../_utils'

const ${camelCase} = defineComponent({
  name: '${camelCaseWithPrefix}',
  props: {},
  setup (props, { emit, slots }) {
    const className = createClassName('${componentName}')

    return () => (
      <div
        class={ className }
      >
        { slots.default?.() }
      </div>
    )
  }
})

export const ${camelCaseWithPrefix} = withInstall(${camelCase})
export default ${camelCase}\n`

const entryScssFileContent = fs.readFileSync('./index.scss', 'utf-8')
const scss = new MagicString(entryScssFileContent)
const lastNewlineIndex = entryScssFileContent.lastIndexOf('\n')

scss.overwrite(lastNewlineIndex, lastNewlineIndex + 1, `\n@import './${componentName}/styles/index.scss';\n`)

const entryJsFileContent = fs.readFileSync('./index.ts', 'utf-8')

const index = new MagicString(entryJsFileContent)

const importStatementIndex = entryJsFileContent.indexOf('\n// #endregion import')
const exportStatementIndex = entryJsFileContent.indexOf('\n// #endregion export')
const registryStatementIndex = entryJsFileContent.indexOf('\n    // #endregion registry')

index.overwrite(
  importStatementIndex,
  importStatementIndex + 1,
  `\nimport { ${camelCaseWithPrefix} } from './${componentName}'\n`
)

index.overwrite(
  exportStatementIndex,
  exportStatementIndex + 1,
  `\nexport * from './${componentName}'\n`
)

index.overwrite(
  registryStatementIndex,
  registryStatementIndex + 1,
  `,\n    ${camelCaseWithPrefix}\n`
)

await $`mkdir ${componentName}`
await $`mkdir ${componentName}/styles`

fs.writeFile(`${componentName}/styles/index.scss`, `.c-${componentName} {}`)
fs.writeFile('./index.scss', scss.toString())

fs.writeFile(`${componentName}/index.tsx`, COMPONENT_TSX)
fs.writeFile('./index.ts', index.toString())

console.log(`${bgGreen(' SUCCESS ')} Component 【${componentName}】 created successfully!`)
