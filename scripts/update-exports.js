import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { globSync } from 'tinyglobby'
import { pascalize } from './utils.js'

const isNeedStageChange = process.argv.includes('--stage')

function updateComponentsIndex() {
  const components = globSync('src/components/**/*.vue')
  const matchRegex = /src\/components\/(.*?)\/index.vue/

  const _components = components.map((file) => {
    const [,name] = file.match(matchRegex) || []

    return {
      name: pascalize(name),
      file: file.replace('src/components', '.'),
    }
  })

  const fileContent = _components.reduce((exports, component) => {
    exports += `export { default as ${component.name} } from '${component.file}'\n`

    return exports
  }, '/* eslint-disable perfectionist/sort-exports */\n')

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

function updateAppVersion() {
  const { version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'))
  const appIndexFileContent = fs.readFileSync(path.join(process.cwd(), 'src', 'index.ts'), 'utf-8')

  // 使用正则表达式匹配 export const version = '.*?', 但替换时只替换版本号
  const versionRegex = /(export const version = ')(\d+\.\d+\.\d+)(')/g

  const newVersion = appIndexFileContent.replace(versionRegex, (_, prefix, oldVersion, suffix) => {
    return prefix + version + suffix
  })

  fs.writeFileSync(path.join(process.cwd(), 'src', 'index.ts'), newVersion)
}

function updateDocsComponents() {
  const components = globSync('packages/docs/src/pages/components/**/*.md')
  const matchRegex = /packages\/docs\/src\/pages\/components\/(.*?)\.md/

  const jsonContent = components.reduce((acc, cur) => {
    const [, name] = cur.match(matchRegex) || []

    acc.push({
      camelized: pascalize(name),
      name,
    })

    return acc
  }, [])

  fs.writeFileSync(path.join(process.cwd(), 'packages', 'docs', 'src', 'consts', 'components.json'), `${JSON.stringify(jsonContent, null, 2)}\n`)
}

updateAppVersion()
updateDocsComponents()
updateComponentsIndex()
updateComposablesIndex()

if (isNeedStageChange) {
  try {
    execSync('git add src/index.ts src/components/index.ts src/composables/index.ts packages/docs/src/consts/components.json')
    execSync('git commit -m "chore: update pkg exports"')
  } catch {
    console.error('Stage change failed')
  }
}
