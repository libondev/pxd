#!/usr/bin/env zx

import { bgRed } from 'kolorist'
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

cd('./components')
await $`mkdir ${componentName}`
await $`mkdir ${componentName}/styles`

const camelCase = toPascalCase(componentName)

const COMPONENT_TSX = `import type { PropType } from 'vue'
import { defineComponent } from 'vue'

import { createClassName } from '../_utils'

export const CAaaBbb = defineComponent({
  name: 'CAaaBbb',
  props: {},
  setup (props, { emit, slots }) {
    const className = createClassName('aaa-bbb')

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

const COMPONENT_STYLE = `@import url(../../base.scss);
.c-${componentName} {}
`

const indexTs = fs.readFileSync('./index.ts', 'utf-8')
const registry = fs.readFileSync('./registry.ts', 'utf-8')

const indexMs = new MagicString(indexTs)

const lastExportStatement = indexTs.indexOf('\n// #endregion')
indexMs.overwrite(
  lastExportStatement,
  lastExportStatement + 1,
  `\nexport * from './${componentName}'\n`
)

const registryMs = new MagicString(registry)
const lastImportStatement = registry.indexOf('\n// #endregion')
const lastRegistryStatement = registry.lastIndexOf('\n] as Array<Component & { name: string }>')

registryMs.overwrite(
  lastImportStatement,
  lastImportStatement + 1,
  `\nimport { C${camelCase} } from './${componentName}'\n`
)

registryMs.overwrite(
  lastRegistryStatement,
  lastRegistryStatement + 1,
  `,\n  C${camelCase},\n`
)

fs.writeFile(`${componentName}/index.tsx`, COMPONENT_TSX)
fs.writeFile(`${componentName}/styles/index.scss`, COMPONENT_STYLE)
fs.writeFile('./index.ts', indexMs.toString())
fs.writeFile('./registry.ts', registryMs.toString())
