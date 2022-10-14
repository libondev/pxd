import { minify } from 'csso'
import glob from 'fast-glob'
import fs from 'fs-extra'
import { join } from 'node:path'
import sass from 'sass'

function slash (path) {
  return path
    .replace(/\\/g, '/')
    .replace(/\/?src\/?/, '')
    .replace(/\.scss$/, '.css')
}

async function buildStyles () {
  const styleFiles = await glob('src/_styles/*.scss')

  styleFiles.push(join('src/_styles/base.scss'))
  styleFiles.push(join('src/_styles/index.scss'))
  styleFiles.push(join('src/_styles/tokens.scss'))
  styleFiles.push(join('src/_styles/transitions.scss'))

  fs.mkdirSync(join('dist/_styles'))

  // src style `.scss` files
  for (const filepath of styleFiles) {
    const { css } = await sass.compileAsync(filepath)
    const targetPath = join('dist', slash(filepath))

    fs.writeFile(targetPath, minify(css).css, 'utf-8')
  }
}

buildStyles().catch(console.error)
