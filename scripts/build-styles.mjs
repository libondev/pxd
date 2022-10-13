import { minify } from 'csso'
import glob from 'fast-glob'
import fs from 'fs-extra'
import { join } from 'node:path'
import sass from 'sass'

function slash (path) {
  return path
    .replace(/\\/g, '/')
    .replace(/\/?src\/?/, '')
    .replace(/\/styles/, '')
    .replace(/\.scss$/, '.css')
}

async function buildStyles () {
  const styleFiles = await glob('src/**/styles/*.scss')

  styleFiles.push(join('src/_styles/base.scss'))
  styleFiles.push(join('src/_styles/transitions.scss'))
  styleFiles.push(join('src/index.scss'))

  fs.mkdirSync(join('dist/_styles'))

  // src style `.scss` files
  for (const filepath of styleFiles) {
    const { css } = await sass.compileAsync(filepath)
    const targetPath = join('dist', slash(filepath))

    fs.writeFile(targetPath, minify(css).css, 'utf-8')
  }
}

buildStyles().catch(console.error)
