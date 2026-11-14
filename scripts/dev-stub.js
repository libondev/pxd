import { lstatSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { build } from 'unbuild'

const rootDir = process.cwd()
const distDir = resolve(rootDir, 'dist')

// Stubbing creates `dist` as a symlink to `src` and fails with EEXIST when the path already
// exists, so every `pnpm dev` after a real build used to die at the first step.
if (lstatSync(distDir, { throwIfNoEntry: false })) {
  rmSync(distDir, { recursive: true, force: true })
}

await build(rootDir, true, { stub: true })
