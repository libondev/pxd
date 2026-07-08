import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { globSync } from 'tinyglobby'
import { humanize, pascalize } from './utils.js'

const isNeedStageChange = process.argv.includes('--stage')

function updateComponentsIndex() {
  const components = globSync('src/components/**/index.vue')
  const matchRegex = /src\/components\/(.*?)\/index\.vue/

  const _components = components.map((file) => {
    const [, name] = file.match(matchRegex) || []

    return {
      name: pascalize(name),
      file: file.replace('src/components', '.'),
    }
  })

  const fileContent = _components.reduce((exports, component) => {
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

/**
 * 根据组件目录生成根目录 `volar.d.ts`，供 Volar 识别全局组件类型。
 */
function updateVolarDts() {
  const root = process.cwd()
  const typePath = path.join(root, 'volar.d.ts')
  const componentVueFiles = globSync('./src/components/*/index.vue', { cwd: root })

  const lines = componentVueFiles.map((p) => {
    const modulePath = p.replace(/src/, 'pxd').replace(/\/index\.vue/, '')
    const [, name] = modulePath.match(/.*\/components\/(.*)/) || []

    return `P${pascalize(name)}: (typeof import('${modulePath}'))['default']`
  })

  const fileContent = `/* prettier-ignore */
// @ts-nocheck
export { }
declare module 'vue' {
  export interface GlobalComponents {
    ${lines.join('\n    ')}
  }
}
`

  fs.writeFileSync(typePath, fileContent, 'utf-8')
}

function updateDocsComponents() {
  const components = globSync('packages/docs/src/pages/components/**/*.md')
  const matchRegex = /packages\/docs\/src\/pages\/components\/(.*?)\.md/

  const jsonContent = components.reduce((acc, cur) => {
    const [, name] = cur.match(matchRegex) || []

    acc.push({
      camelized: humanize(name),
      name,
    })

    return acc
  }, [])

  fs.writeFileSync(
    path.join(process.cwd(), 'packages', 'docs', 'src', 'consts', 'components.json'),
    `${JSON.stringify(jsonContent, null, 2)}\n`,
  )
}

function updateDocsComposables() {
  const composables = globSync('packages/docs/src/pages/composables/**/*.md')
  const matchRegex = /packages\/docs\/src\/pages\/composables\/(.*?)\.md/

  const jsonContent = composables.reduce((acc, cur) => {
    const [, name] = cur.match(matchRegex) || []

    acc.push({
      camelized: humanize(name),
      name,
    })

    return acc
  }, [])

  fs.writeFileSync(
    path.join(process.cwd(), 'packages', 'docs', 'src', 'consts', 'composables.json'),
    `${JSON.stringify(jsonContent, null, 2)}\n`,
  )
}

updateDocsComponents()
updateDocsComposables()
updateComponentsIndex()
updateComposablesIndex()
updateVolarDts()

if (isNeedStageChange) {
  try {
    execSync(
      'git add volar.d.ts src/index.ts src/components/index.ts src/composables/index.ts packages/docs/src/consts/components.json packages/docs/src/consts/composables.json',
    )
    execSync('git commit -m "chore: update pkg exports"')
  } catch {
    console.error('Stage change failed')
  }
}
