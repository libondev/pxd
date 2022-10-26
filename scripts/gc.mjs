#!/usr/bin/env zx

import { $, cd, fs } from 'zx'
import { bgGreen, bgRed } from 'kolorist'

import MagicString from 'magic-string'
import process from 'node:process'

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

if (!/^[a-zA-Z]+?[-|_|a-zA-Z0-9]*?$/.test(componentName)) {
  console.log(bgRed(` Invalid component name:【${componentName}】 `))
  process.exit(1)
}

cd('./src')

const camelCase = toCamelCase(componentName)
const camelCaseWithPrefix = `Px${camelCase}`

const COMPONENT_INDEX = `import ${camelCase} from './src/${componentName}.vue'
import { withInstall } from '../_utils'

export const ${camelCaseWithPrefix} = withInstall(${camelCase})
export default ${camelCase}\n`

const CONSTRAINTS = `import type { ExtractPropTypes, PropType } from 'vue'

export const ${componentName}Props = {

}

export type ${camelCase}Props = ExtractPropTypes<typeof ${componentName}Props>
`

const COMPONENT_VUE = `<template>
  <div class="px-${componentName}"></div>
</template>

<script lang="ts" setup name="${camelCaseWithPrefix}">
import { ${componentName}Props } from './constraints'

const props = defineProps(${componentName}Props)
</script>
`

const entryScssFileContent = fs.readFileSync('./_styles/index.scss', 'utf-8')
const lastNewlineIndex = entryScssFileContent.lastIndexOf('\n')

const scss = new MagicString(entryScssFileContent)

scss.overwrite(lastNewlineIndex, lastNewlineIndex + 1, `\n@import "./${componentName}.scss";\n`)

const entryJsFileContent = fs.readFileSync('./index.ts', 'utf-8')
const importStatementIndex = entryJsFileContent.indexOf('\n// #endregion import')
const exportStatementIndex = entryJsFileContent.indexOf('\n// #endregion export')
const registryStatementIndex = entryJsFileContent.indexOf('\n    // #endregion registry')

const index = new MagicString(entryJsFileContent)

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

try {
  fs.statSync(componentName)
  fs.emptyDir(componentName)
  await $`mkdir ${componentName}/src`
} catch (e) {
  await $`mkdir ${componentName}`
  await $`mkdir ${componentName}/src`
}

fs.writeFile(`./_styles/${componentName}.scss`, `.px-${componentName} {}`)
fs.writeFile('./_styles/index.scss', scss.toString())

fs.writeFile(`${componentName}/index.ts`, COMPONENT_INDEX)
fs.writeFile(`${componentName}/src/constraints.ts`, CONSTRAINTS)
fs.writeFile(`${componentName}/src/${componentName}.vue`, COMPONENT_VUE)
fs.writeFile('./index.ts', index.toString())

console.log(`${bgGreen(' SUCCESS ')} Component【${componentName}】created successfully!`)
