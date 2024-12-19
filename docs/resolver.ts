import type { ComponentResolver } from 'unplugin-vue-components'

const NAMESPACE = 'P'

const sideEffects = {
  'code-block': ['@/../../src/styles/code-block.css'],
}

const getPath = (name: string) => `@/../../src/components/${name}/index`

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
