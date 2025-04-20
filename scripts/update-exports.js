// @ts-check

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { globSync } from 'tinyglobby'

const files = globSync('src/components/**/*.vue')

function toPascalCase(str) {
  if (!str)
    return ''

  return str
    .split(/[^a-z0-9]/i)
    .map((word) => {
      if (!word.length)
        return ''

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

const componentNameRegex = /src\/components\/(.*?)\/index.vue/

const components = files.map((file) => {
  const [,name] = file.match(componentNameRegex) || []

  return {
    name: toPascalCase(name),
    file: file.replace('src', '.'),
  }
})

let importsContent = 'import type { App } from \'vue\'\n'
let exportsContent = 'export {\n'

const fullRegistry = `const components = [${components.map(({ name }) => name).join(', ')}]
export default function install(app: App) {
  components.forEach((component) => {
    app.component(component.name!, component)
  })
}
`

components.forEach((component) => {
  importsContent += `import ${component.name} from '${component.file}'\n`
  exportsContent += `  ${component.name},\n`
})

const fileContent = `${importsContent}\n${fullRegistry}\n${exportsContent}}\n`

fs.writeFileSync(path.join(process.cwd(), 'src', 'index.ts'), fileContent)
