import { cwd } from 'node:process'
import { resolve } from 'path'

export const BUILD_INPUT = './src/index.ts'

export const BUILD_EXTERNAL = ['vue']

export const BUILD_TARGET = 'es2018'

export const BUILD_ALIAS = {
  entries: [
    { find: '@', replacement: resolve(cwd(), './src') },
    { find: '@types', replacement: resolve(cwd(), './types') }
  ]
}

export const ESBUILD_OPTIONS = {
  tsconfig: '../tsconfig.json',
  jsxFragment: 'Fragment',
  target: BUILD_TARGET,
  treeShaking: true,
  jsx: 'transform',
  jsxFactory: 'h',
  loaders: {
    '.vue': 'ts'
  }
}
