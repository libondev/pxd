import glob from 'fast-glob'
import { resolve } from 'path'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import sass from 'rollup-plugin-sass'

import {
  BUILD_EXTERNAL,
  ESBUILD_OPTIONS
} from './constants.js'

export default async function () {
  const input = await glob('src/**/index.ts')

  const bundle = await rollup({
    input,
    external: BUILD_EXTERNAL,
    plugins: [
      sass(),
      esbuild(ESBUILD_OPTIONS)
    ]
  })

  await bundle.write({
    module: 'ESNext',
    format: 'esm',
    output: {
      name: 'es',
      preserveModules: true,
      preserveModulesRoot: resolve(process.cwd(), 'dist/'),
      dir: resolve(process.cwd(), 'dist/')
    },
    bundle: {
      path: resolve(process.cwd(), 'dist/')
    }
  })

  console.log(bundle)
}
