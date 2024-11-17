/* eslint-disable node/prefer-global/process */

import type { ComponentResolver } from 'unplugin-vue-components'
import { name } from '../../package.json'

const NAMESPACE = name[0].toUpperCase()

const LIBRARY_NAME = process.env.NODE_ENV === 'development'
  ? new URL(/* @vite-ignore */ '../../src', import.meta.url).pathname
  : `${name}/dist`

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
        sideEffects: [],
      }
    },
  }
}

export default PxdResolver
