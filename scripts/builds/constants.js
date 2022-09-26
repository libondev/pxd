export const BUILD_INPUT = './index.ts'

export const BUILD_EXTERNAL = ['vue']

export const BUILD_TARGET = 'es2018'

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
