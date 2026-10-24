import { mkdist } from 'mkdist'
import { lstatSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const distDir = resolve(process.cwd(), 'dist')

// dev:lib leaves dist as a symlink to src — mkdist would write through it into the sources.
if (lstatSync(distDir, { throwIfNoEntry: false })?.isSymbolicLink()) {
  rmSync(distDir)
}

await mkdist({
  declaration: true,
  srcDir: 'src',
  distDir: 'dist',
  ext: 'js',
  format: 'esm',
  loaders: ['js', 'vue', 'sass', 'postcss'],
})
