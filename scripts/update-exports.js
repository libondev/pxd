// @ts-check

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { globSync } from 'tinyglobby'

/**
 * @param {string} name 组件名称
 * @returns {string} 组件名称的 PascalCase 形式
 */
function toPascalCase(name) {
  if (!name)
    return ''

  return name
    .split(/[^a-z0-9]/i)
    .map((word) => {
      if (!word.length)
        return ''

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

function updateComponentsIndex() {
  const files = globSync('src/components/**/*.vue')

  const matchRegex = /src\/components\/(.*?)\/index.vue/

  const components = files.map((file) => {
    const [,name] = file.match(matchRegex) || []

    return {
      name: toPascalCase(name),
      file: file.replace('src/components', '.'),
    }
  })

  const fileContent = components.reduce((exports, component) => {
    exports += `export { default as ${component.name} } from '${component.file}'\n`

    return exports
  }, '')

  fs.writeFileSync(path.join(process.cwd(), 'src', 'components', 'index.ts'), fileContent)
}

updateComponentsIndex()
