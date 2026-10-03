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

// Generate the root `volar.d.ts` from component dirs so Volar picks up global component types.
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

const DEFAULT_COMPONENT_CATEGORY = 'Uncategorized'

function readExistingCategories(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    return new Map()
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

    return new Map(
      parsed
        .filter((item) => item && typeof item.name === 'string')
        .map((item) => [item.name, item.category ?? DEFAULT_COMPONENT_CATEGORY]),
    )
  } catch {
    console.error(
      `Failed to parse ${jsonPath}, every component falls back to "${DEFAULT_COMPONENT_CATEGORY}"`,
    )

    return new Map()
  }
}

function updateDocsComponents() {
  const jsonPath = path.join(process.cwd(), 'packages', 'docs', 'src', 'consts', 'components.json')
  const components = globSync('packages/docs/src/pages/components/**/*.md')
  const matchRegex = /packages\/docs\/src\/pages\/components\/(.*?)\.md/
  const categories = readExistingCategories(jsonPath)

  const jsonContent = components.map((cur) => {
    const [, name] = cur.match(matchRegex) || []

    return {
      camelized: humanize(name),
      name,
      category: categories.get(name) ?? DEFAULT_COMPONENT_CATEGORY,
    }
  })

  const uncategorized = jsonContent.filter((item) => item.category === DEFAULT_COMPONENT_CATEGORY)

  if (uncategorized.length > 0) {
    console.warn(
      `New components need a category in ${jsonPath}: ${uncategorized.map((item) => item.name).join(', ')}`,
    )
  }

  fs.writeFileSync(jsonPath, `${JSON.stringify(jsonContent, null, 2)}\n`)
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
