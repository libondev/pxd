import { rollup } from 'rollup'
import esbuild, { minify as minifyPlugin } from 'rollup-plugin-esbuild'
import sass from 'rollup-plugin-sass'

import {
  BUILD_EXTERNAL,
  BUILD_INPUT,
  BUILD_TARGET,
  ESBUILD_OPTIONS
} from './constants.js'

export default async function () {
  const bundle = await rollup({
    treeshake: true,
    input: BUILD_INPUT,
    external: BUILD_EXTERNAL,
    plugins: [
      sass(),
      esbuild(ESBUILD_OPTIONS),
      minifyPlugin({
        sourceMap: true,
        target: BUILD_TARGET
      })
    ]
  })

  await bundle.write({
    format: 'esm',
    banner: '/* eslint-disable */',
    file: 'dist/index.min.js'
  })
}