#!/usr/bin/env zx

import { bgGreen, bgRed } from 'kolorist'
import MagicString from 'magic-string'
import process from 'node:process'
import { $, cd, fs } from 'zx'

$.quiet = true

function capitalize (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function toCamelCase (string) {
  return string.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

function toPascalCase (string) {
  return capitalize(toCamelCase(string))
}

const [,,, componentName] = process.argv

if (!/[a-zA-Z]+/.test(componentName)) {
  console.log(bgRed(` Invalid component name:【${componentName}】 `))
  process.exit(1)
}

cd('./src')

const camelCase = `C${toPascalCase(componentName)}`

const COMPONENT_TSX = `import type { App, PropType } from 'vue'
import { defineComponent } from 'vue'

import { createClassName } from '../_utils'

const ${camelCase} = defineComponent({
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
  },
  install (app: App) {
    app.component(${camelCase}.name, ${camelCase})
  }
})\n
export { ${camelCase}, ${camelCase} as default }
`

const entryScssFileContent = fs.readFileSync('./index.scss', 'utf-8')
const scssMs = new MagicString(entryScssFileContent)
const lastNewlineIndex = entryScssFileContent.lastIndexOf('\n')

scssMs.overwrite(lastNewlineIndex, lastNewlineIndex + 1, `\n@import './${componentName}/styles/index.scss';\n`)

const entryJsFileContent = fs.readFileSync('./index.ts', 'utf-8')

const entry = new MagicString(entryJsFileContent)

const importStatementIndex = entryJsFileContent.indexOf('\n// #endregion import')
const exportStatementIndex = entryJsFileContent.indexOf('\n// #endregion export')
const registryStatementIndex = entryJsFileContent.indexOf('\n    // #endregion registry')

entry.overwrite(
  importStatementIndex,
  importStatementIndex + 1,
  `\nimport { ${camelCase} } from './${componentName}'\n`
)

entry.overwrite(
  exportStatementIndex,
  exportStatementIndex + 1,
  `\nexport * from './${componentName}'\n`
)

entry.overwrite(
  registryStatementIndex,
  registryStatementIndex + 1,
  `,\n    ${camelCase}\n`
)

await $`mkdir ${componentName}`
await $`mkdir ${componentName}/styles`

fs.writeFile(`${componentName}/index.tsx`, COMPONENT_TSX)
fs.writeFile('./index.ts', entry.toString())

fs.writeFile(`${componentName}/styles/index.scss`, `.c-${componentName} {}`)
fs.writeFileSync('./index.scss', scssMs.toString())

console.log(`${bgGreen(' SUCCESS ')} Component 【${componentName}】 created successfully!`)
