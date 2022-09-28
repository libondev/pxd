import alias from '@rollup/plugin-alias'
import glob from 'fast-glob'
import { resolve } from 'path'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import sass from 'rollup-plugin-sass'

import {
  BUILD_ALIAS,
  BUILD_EXTERNAL,
  ESBUILD_OPTIONS
} from './constants.js'

export default async function () {
  const input = await glob('src/**/index.ts')

  const bundle = await rollup({
    input,
    external: BUILD_EXTERNAL,
    plugins: [
      alias(BUILD_ALIAS),
      sass({
        output: (styles, styleNodes) => {
          console.log({ styleNodes })
        }
      }),
      esbuild(ESBUILD_OPTIONS)
    ]
  })

  const outputDir = resolve(process.cwd(), 'dist/')

  await bundle.write({
    module: 'ESNext',
    format: 'esm',
    output: {
      name: 'es',
      preserveModules: true,
      preserveModulesRoot: outputDir,
      dir: outputDir
    },
    bundle: {
      path: outputDir
    }
  })
}
