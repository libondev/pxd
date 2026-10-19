import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { resolve, sep } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const srcDir = resolve(root, 'src')
const distDir = resolve(root, 'dist')
const distStyleDir = resolve(distDir, 'styles')
const distTwPath = resolve(distStyleDir, 'tw.css')
const distSourcePath = resolve(distStyleDir, 'source.css')
const distStylesPath = resolve(distStyleDir, 'styles.css')

function assertRealDist() {
  if (!existsSync(distDir)) {
    throw new Error('dist/ is missing — run `pnpm build:core` before generating styles')
  }

  const distReal = realpathSync(distDir)
  const srcReal = realpathSync(srcDir)

  if (distReal === srcReal || distReal.startsWith(`${srcReal}${sep}`)) {
    throw new Error(
      'dist/ currently stubs src/ (dev:lib). Run `pnpm build:core` first so style output is not written into source.',
    )
  }
}

assertRealDist()

const styles = readFileSync(resolve(srcDir, 'styles', 'tw.css'), 'utf-8')

// Intermediate Tailwind entry: lives under dist/styles so @source ../components etc. resolve to built files.
const sourceCss = `@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

${styles}
`

mkdirSync(distStyleDir, { recursive: true })
writeFileSync(distTwPath, styles, 'utf-8')
writeFileSync(distSourcePath, sourceCss, 'utf-8')

try {
  const tailwindCli = resolve(root, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs')

  const result = spawnSync(process.execPath, [tailwindCli, '-i', distSourcePath, '-o', distStylesPath, '-m'], {
    cwd: root,
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
} finally {
  if (existsSync(distSourcePath)) {
    unlinkSync(distSourcePath)
  }
}
