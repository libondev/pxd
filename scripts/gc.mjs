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
await $`mkdir ${componentName}`
await $`mkdir ${componentName}/styles`

const camelCase = toPascalCase(componentName)

const COMPONENT_TSX = `import type { PropType } from 'vue'
import { defineComponent } from 'vue'

import { createClassName } from '../_utils'

export const C${camelCase} = defineComponent({
  name: 'C${camelCase}',
  props: {},
  setup (props, { emit, slots }) {
    const className = createClassName('${componentName}')

    return () => (
      <div
        class={ className }
      >
        { slots.default!() }
      </div>
    )
  }
})
`

const COMPONENT_STYLE = `@import url(../../_styles/base.css);
.c-${componentName} {}
`

fs.writeFile(`${componentName}/index.tsx`, COMPONENT_TSX)
fs.writeFile(`${componentName}/styles/index.scss`, COMPONENT_STYLE)

const indexScss = fs.readFileSync('./index.scss', 'utf-8')
const scssMs = new MagicString(indexScss)
const lastNewlineIndex = indexScss.lastIndexOf('\n')

scssMs.overwrite(lastNewlineIndex, lastNewlineIndex + 1, `\n@import './${componentName}/styles/index.scss';\n`)
fs.writeFileSync('./index.scss', scssMs.toString())

const indexTs = fs.readFileSync('./index.ts', 'utf-8')
const registryTs = fs.readFileSync('./registry.ts', 'utf-8')

const entryMs = new MagicString(indexTs)

const lastExportStatement = indexTs.indexOf('\n// #endregion')
entryMs.overwrite(
  lastExportStatement,
  lastExportStatement + 1,
  `\nexport * from './${componentName}'\n`
)

fs.writeFile('./index.ts', entryMs.toString())

const registryMs = new MagicString(registryTs)
const lastImportStatement = registryTs.indexOf('\n// #endregion')
const lastRegistryStatement = registryTs.lastIndexOf('\n] as Array<Component & { name: string }>')

registryMs.overwrite(
  lastImportStatement,
  lastImportStatement + 1,
  `\nimport { C${camelCase} } from './${componentName}'\n`
)

registryMs.overwrite(
  lastRegistryStatement,
  lastRegistryStatement + 1,
  `,\n  C${camelCase}\n`
)

fs.writeFile('./registry.ts', registryMs.toString())

console.log(bgGreen(' SUCCESS '))
