// @ts-check

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { camelize } from '@vue/shared'
import { globSync } from 'tinyglobby'

/**
 * @param {string} name
 * @returns {string} 转换后的字符串
 */
function pascalize(name) {
  const camelized = camelize(name)
  return camelized.charAt(0).toUpperCase() + camelized.slice(1)
}

function updateComponentsIndex() {
  const files = globSync('src/components/**/*.vue')

  const matchRegex = /src\/components\/(.*?)\/index.vue/

  const components = files.map((file) => {
    const [,name] = file.match(matchRegex) || []

    return {
      name: pascalize(name),
      file: file.replace('src/components', '.'),
    }
  })

  const fileContent = components.reduce((exports, component) => {
    exports += `export { default as ${component.name} } from '${component.file}'\n`

    return exports
  }, '')

  fs.writeFileSync(path.join(process.cwd(), 'src', 'components', 'index.ts'), fileContent)
}

function updateComposablesIndex() {
  const files = globSync(['src/composables/*.ts', '!src/composables/index.ts'])

  const matchRegex = /src\/composables\/(.*?)\.ts/

  const composables = files.map((file) => {
    const [, name] = file.match(matchRegex) || []

    return {
      name: pascalize(name),
      file: `./${name}.js`,
    }
  })

  const fileContent = composables.reduce((exports, composable) => {
    exports += `export * from '${composable.file}'\n`

    return exports
  }, '')

  fs.writeFileSync(path.join(process.cwd(), 'src', 'composables', 'index.ts'), fileContent)
}

async function updateAppVersion() {
  const { version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'))
  const appIndexFileContent = fs.readFileSync(path.join(process.cwd(), 'src', 'index.ts'), 'utf-8')

  // 使用正则表达式匹配 export const version = '.*?', 但替换时只替换版本号
  const versionRegex = /(export const version = ')(\d+\.\d+\.\d+)(')/g

  const newVersion = appIndexFileContent.replace(versionRegex, (_, prefix, oldVersion, suffix) => {
    return prefix + version + suffix
  })

  fs.writeFileSync(path.join(process.cwd(), 'src', 'index.ts'), newVersion)
}

updateAppVersion()
updateComponentsIndex()
updateComposablesIndex()
