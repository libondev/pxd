import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { cancel, confirm, intro, isCancel, outro, select, text } from '@clack/prompts'
import { findUp } from 'find-up'
import fs from 'fs-extra'
import {
  ensureDummyImport,
  insertIntoVitePlugins,
} from '../utils/insert-config'
import {
  getRelativePathByFile,
  getRelativePathFromRoot,
  readOrCreate,
  upsertFile,
} from '../utils/path'

const STYLE_FRAMEWORKS = [
  {
    label: 'TailwindCSS',
    value: 'tailwindcss',
  },
  // {
  //   label: 'UnoCSS',
  //   value: 'unocss',
  // },
  {
    label: 'None',
    value: 'none',
  },
]

const BUNDLER_TYPES = [
  {
    label: 'Vite',
    value: 'vite',
  },
  // {
  //   label: 'Webpack',
  //   value: 'webpack',
  // },
]

type StyleFramework = (typeof STYLE_FRAMEWORKS)[number]['value']
type BundlerFramework = (typeof BUNDLER_TYPES)[number]['value']

export async function init() {
  intro('Welcome to the PXD CLI')

  const packagePath = await findUp('package.json', { cwd: process.cwd() })

  if (!packagePath) {
    throw new Error('package.json not found, please run this command in a project directory')
  }

  const projectDir = path.join(packagePath, '..')

  const packageJson = await findPackageJson(packagePath)

  const willInstallDependencies: string[] = []
  const willInstallDevDependencies: string[] = []

  const cancelSelect = () => cancel('Operation cancelled, see you next time')

  const styleFramework = await select({
    message: 'Select a styles framework:',
    options: STYLE_FRAMEWORKS,
  })

  if (isCancel(styleFramework)) {
    return cancelSelect()
  }

  const usingBundler = await select({
    message: 'What bundler are you using?',
    options: BUNDLER_TYPES,
  })

  if (isCancel(usingBundler)) {
    return cancelSelect()
  }

  const globalStylePath = await text({
    message: 'Enter the path to the global style file:',
    defaultValue: 'src/styles/global.css',
    placeholder: 'src/styles/global.css',
  })

  if (isCancel(globalStylePath)) {
    return cancelSelect()
  }

  const isInstalledTs = isInstalled(packageJson, 'typescript')
  const entryFilePath = isInstalledTs ? 'src/main.ts' : 'src/main.js'

  const appEntryFilePath = await text({
    message: 'Enter the path to the app entry file:',
    defaultValue: entryFilePath,
    placeholder: entryFilePath,
  })

  if (isCancel(appEntryFilePath)) {
    return cancelSelect()
  }

  const enableAutoImport = await confirm({
    message: 'Enable components auto import?',
    initialValue: true,
  })

  if (isCancel(enableAutoImport)) {
    return cancelSelect()
  }

  if (!isInstalled(packageJson, 'pxd')) {
    willInstallDependencies.push('pxd@latest')
  }

  if (styleFramework !== 'none') {
    if (styleFramework === 'tailwindcss' && !isInstalled(packageJson, 'tailwindcss')) {
      willInstallDevDependencies.push('tailwindcss@^4')

      if (usingBundler === 'vite') {
        willInstallDevDependencies.push('@tailwindcss/vite@^4')
      }
    } else if (styleFramework === 'unocss' && !isInstalled(packageJson, 'tailwindcss')) {
      willInstallDevDependencies.push('unocss@66')
    }
  }

  if (enableAutoImport) {
    if (!isInstalled(packageJson, 'unplugin-auto-import')) {
      willInstallDevDependencies.push('unplugin-auto-import@^19')
    }

    if (!isInstalled(packageJson, 'unplugin-vue-components')) {
      willInstallDevDependencies.push('unplugin-vue-components@^28')
    }
  }

  // defineOptions macro plugin support
  const installedVue = isInstalled(packageJson, 'vue') || ''

  if (!installedVue) {
    const [vueMajorVersion = '3', vueMinorVersion = '3'] = installedVue.replace(/^([~^v])?/, '').split('.')

    if (vueMajorVersion === '2' && vueMinorVersion === '7') {
      willInstallDevDependencies.push('unplugin-vue-define-options@^1.5.5')
    } else if (vueMajorVersion === '3' && Number(vueMinorVersion) < 3) {
      willInstallDevDependencies.push('unplugin-vue-define-options@^3')
    }
  }

  const allDependencies = [...willInstallDependencies, ...willInstallDevDependencies]

  if (allDependencies.length > 0) {
    const looksGood = await confirm({
      message: `The following dependencies will be added to package.json:\n\t${allDependencies.join('\n\t')}\n`,
      initialValue: true,
    })

    if (isCancel(looksGood)) {
      return cancelSelect()
    }
  }

  await updatePkgDeps(packageJson, willInstallDependencies, willInstallDevDependencies)
  await injectStyles(projectDir, appEntryFilePath, globalStylePath, styleFramework)
  await injectPlugin(projectDir, usingBundler, isInstalledTs, willInstallDevDependencies)
  await updatePkgJson(packagePath, packageJson)

  outro('Thank you for using PXD CLI')
}

async function findPackageJson(projectDir: string) {
  const content = await fs.readJson(projectDir, 'utf-8')
  return content
}

function isInstalled(packageJson: Record<string, any>, packageName: string) {
  return (packageJson.dependencies && packageName in packageJson.dependencies) || (packageJson.devDependencies && packageName in packageJson.devDependencies)
}

function getDepNameAndVersion(dependency: string) {
  const [name, version] = dependency.slice(1).split('@')

  return [`${dependency.slice(0, 1)}${name}`, version]
}

async function updatePkgDeps(pkgJson: Record<string, any>, dependencies: string[], devDependencies: string[]) {
  pkgJson.dependencies ??= {}
  pkgJson.devDependencies ??= {}

  dependencies.forEach((dependency) => {
    const [name, version] = getDepNameAndVersion(dependency)

    pkgJson.dependencies[name] = version
  })

  devDependencies.forEach((dependency) => {
    const [name, version] = getDepNameAndVersion(dependency)

    pkgJson.devDependencies[name] = version
  })
}

async function updatePkgJson(packagePath: string, pkgJson: Record<string, any>) {
  await fs.outputJson(packagePath, pkgJson, { spaces: 2 })
}

async function injectStyles(
  rootPath: string,
  entryFilePath: string,
  globalStylePath: string,
  styleFramework: StyleFramework,
) {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const templatePath = path.resolve(currentDir, '..', 'src', 'templates', 'styles', styleFramework, 'global.css')

  const templateContent = await fs.readFile(templatePath, 'utf-8') as string
  const fileContent = templateContent.replace(/#ROOT/g, getRelativePathFromRoot(globalStylePath))
  const globalStyleContent = await readOrCreate(path.join(rootPath, globalStylePath))

  await upsertFile(path.join(rootPath, globalStylePath), globalStyleContent, fileContent, 'start')

  // update entry file
  const entryFileContent = await readOrCreate(path.join(rootPath, entryFilePath))

  await upsertFile(path.join(rootPath, entryFilePath), entryFileContent, `import '${getRelativePathByFile(entryFilePath, globalStylePath)}'`, 'start')
}

const bundlerConfigFileName = {
  vite: 'vite.config',
  // webpack: '',
}

async function injectPlugin(
  root: string,
  bundler: BundlerFramework,
  isTs: boolean,
  deps: string[],
) {
  const ext = isTs ? '.ts' : '.js'
  const configPath = path.join(root, `${bundlerConfigFileName[bundler]}${ext}`)
  let fileContent = await readOrCreate(configPath)

  if (deps.includes('unocss')) {
    fileContent = ensureDummyImport(fileContent, 'unocss', 'unocss/vite')
    fileContent = insertIntoVitePlugins(fileContent, 'unocss()')
  }

  if (deps.includes('tailwindcss')) {
    fileContent = ensureDummyImport(fileContent, 'tailwindcss', '@tailwindcss/vite')
    fileContent = insertIntoVitePlugins(fileContent, 'tailwindcss()')
  }

  if (deps.includes('unplugin-auto-import')) {
    fileContent = ensureDummyImport(fileContent, 'AutoImport', 'unplugin-auto-imports/vite')
    fileContent = insertIntoVitePlugins(fileContent, `autoImport({ imports: ['vue'] })`)
  }

  if (deps.includes('unplugin-vue-components')) {
    fileContent = ensureDummyImport(fileContent, 'components', 'unplugin-vue-components/vite')
    fileContent = ensureDummyImport(fileContent, 'pxdResolver', 'pxd/resolver')
    fileContent = insertIntoVitePlugins(fileContent, `components({ resolvers: [PxdResolver()] })`)
  }

  await fs.writeFile(configPath, fileContent)
}
