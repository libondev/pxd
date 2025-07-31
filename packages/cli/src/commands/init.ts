import path from 'node:path'
import process from 'node:process'
import { cancel, confirm, intro, isCancel, outro, select, text } from '@clack/prompts'
import { findUp } from 'find-up'
import fs from 'fs-extra'
import {
  getRelativePathByFile,
  getRelativePathFromRoot,
  readOrCreate,
  upsertFile,
} from '../utils/path'

const STYLE_FRAMEWORKS = [
  // {
  //   value: 'unocss',
  //   label: 'UnoCSS',
  // },
  {
    value: 'tailwindcss',
    label: 'TailwindCSS',
  },
  {
    value: 'none',
    label: 'None',
  },
]

const BUNDLER_TYPES = [
  {
    value: 'vite',
    label: 'Vite',
  },
  {
    value: 'webpack',
    label: 'Webpack',
  },
]

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
    message: 'Select a styles framework',
    options: STYLE_FRAMEWORKS,
  })

  if (isCancel(styleFramework)) {
    return cancelSelect()
  }

  const entryFilePath = isInstalled(packageJson, 'typescript') ? 'src/main.ts' : 'src/main.js'

  const appEntryFilePath = await text({
    message: 'Enter the path to the app entry file',
    defaultValue: entryFilePath,
    placeholder: entryFilePath,
  })

  if (isCancel(appEntryFilePath)) {
    return cancelSelect()
  }

  const globalStylePath = await text({
    message: 'Enter the path to the global style file',
    defaultValue: 'src/styles/global.css',
    placeholder: 'src/styles/global.css',
  })

  if (isCancel(globalStylePath)) {
    return cancelSelect()
  }

  const enableAutoImport = await confirm({
    message: 'Enable components auto import(Recommended)?',
    initialValue: true,
  })

  if (isCancel(enableAutoImport)) {
    return cancelSelect()
  }

  const usingWhatBundler = await select({
    message: 'What bundler are you using?',
    options: BUNDLER_TYPES,
  })

  if (isCancel(usingWhatBundler)) {
    return cancelSelect()
  }

  if (!isInstalled(packageJson, 'pxd')) {
    willInstallDependencies.push('pxd@latest')
  }

  if (!isInstalled(packageJson, 'tailwindcss')) {
    willInstallDevDependencies.push('tailwindcss@^4')

    if (usingWhatBundler === 'vite') {
      willInstallDevDependencies.push('@tailwindcss/vite@^4')
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
  await injectPlugin(projectDir, usingWhatBundler)
  await updatePkgJson(packagePath, packageJson)

  outro('Thank you for using PXD CLI')
}

async function findPackageJson(projectDir: string) {
  return JSON.parse(await fs.readFile(projectDir, 'utf-8'))
}

function isInstalled(packageJson: Record<string, any>, packageName: string) {
  return packageJson.dependencies?.[packageName] || packageJson.devDependencies?.[packageName]
}

async function updatePkgDeps(pkgJson: Record<string, any>, dependencies: string[], devDependencies: string[]) {
  pkgJson.dependencies ??= {}
  pkgJson.devDependencies ??= {}

  dependencies.forEach((dependency) => {
    const [name, version] = splitDependencySafely(dependency)

    pkgJson.dependencies[name] = version
  })

  devDependencies.forEach((dependency) => {
    const [name, version] = splitDependencySafely(dependency)

    pkgJson.devDependencies[name] = version
  })
}

function splitDependencySafely(dependency: string) {
  const [name, version] = dependency.slice(1).split('@')

  return [`${dependency.slice(0, 1)}${name}`, version]
}

async function injectStyles(
  rootPath: string,
  entryFilePath: string,
  globalStylePath: string,
  styleFramework: (typeof STYLE_FRAMEWORKS)[number]['value'],
) {
  const globalStyleContent = await readOrCreate(path.join(rootPath, globalStylePath))

  const templatePath = path.join(process.cwd(), 'src/templates/styles', styleFramework)
  const templateContent = (await fs.readFile(path.join(templatePath, 'global.css'), 'utf-8')).replace(/#ROOT/g, getRelativePathFromRoot(globalStylePath))

  await upsertFile(path.join(rootPath, globalStylePath), globalStyleContent, templateContent, 'start')

  // update entry file
  const entryFileContent = await readOrCreate(path.join(rootPath, entryFilePath))

  await upsertFile(path.join(rootPath, entryFilePath), entryFileContent, `import '${getRelativePathByFile(entryFilePath, globalStylePath)}'`, 'start')
}

async function injectPlugin(
  rootPath: string,
  bundlerType: (typeof BUNDLER_TYPES)[number]['value'],
) {
  console.info('🛰️init.ts:181/(rootPath):\n', rootPath, bundlerType)
}

async function updatePkgJson(packagePath: string, pkgJson: Record<string, any>) {
  await fs.outputJson(packagePath, pkgJson, { spaces: 2 })
}
