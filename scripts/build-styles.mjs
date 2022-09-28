import { minify } from 'csso'
import glob from 'fast-glob'
import fs from 'fs-extra'
import { join } from 'node:path'
import sass from 'sass'

function slash (path) {
  return path
    .replace(/\\/g, '/')
    .replace(/\/?components\/?/, '')
    .replace(/\/styles/, '')
    .replace(/\.scss$/, '.css')
}

async function buildStyles () {
  const styleFiles = await glob('components/**/styles/*.scss')

  styleFiles.push(join('components', 'base.scss'))
  styleFiles.push(join('components', 'index.scss'))

  // components style `.scss` files
  for (const filepath of styleFiles) {
    const { css } = await sass.compileAsync(filepath)
    const targetPath = join('dist', slash(filepath))

    fs.writeFileSync(targetPath, minify(css).css, 'utf-8')
  }
}

buildStyles().catch(console.error)
