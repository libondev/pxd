import type { ComponentResolver } from 'unplugin-vue-components'

const LIBRARY_NAME = 'pxd'

interface ResolverOptions {
  /**
   * Replaces the component prefix used for automatic import.
   * @default 'Px'
   */
  namespace: string
}

export default ({ namespace = 'Px' } = {} as ResolverOptions): ComponentResolver => ({
  type: 'component',
  resolve: (name: string) => {
    const prefixRegex = new RegExp(`^${namespace}[A-Z]`)

    if (!name.match(prefixRegex)) { return }

    const partialName = name
      .replace(new RegExp(namespace, 'i'), '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .slice(1)

    return {
      importName: name,
      from: `${LIBRARY_NAME}/components/${partialName}/index.js`,
      sideEffects: []
    }
  }
})
