/* eslint-disable node/prefer-global/process */

import type { ComponentResolver } from 'unplugin-vue-components'
import { name } from '../../package.json'

const NAMESPACE = name[0].toUpperCase()

let LIBRARY_NAME = name
if (process.env.NODE_ENV === 'development') {
  if (process.env.CI) {
    LIBRARY_NAME = new URL(/* @vite-ignore */ '../../dist', import.meta.url).pathname
  }
  else {
    LIBRARY_NAME = new URL(/* @vite-ignore */ '../../src', import.meta.url).pathname
  }
}

const sideEffects = {
  'code-block': ['pxd/code-block.css'],
}

const getPath = (() => {
  const suffix = process.env.NODE_ENV === 'development' ? '' : '.js'
  return (name: string) => `${LIBRARY_NAME}/components/${name}/index${suffix}`
})()

function PxdResolver(): ComponentResolver {
  return {
    type: 'component',
    resolve: (name: string) => {
      const prefixRegex = new RegExp(`^${NAMESPACE}[A-Z]`)

      if (!name.match(prefixRegex))
        return

      const partialName = name
        .replace(new RegExp(NAMESPACE, 'i'), '')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .slice(1)

      return {
        importName: name,
        from: getPath(partialName),
        sideEffects: sideEffects[partialName] || [],
      }
    },
  }
}

export default PxdResolver
