import type { ComponentResolver } from 'unplugin-vue-components'
import { name as LIBRARY_NAME } from '../../package.json'

interface ResolverOptions {
  /**
   * Replaces the component prefix used for automatic import.
   * @default 'P'
   */
  namespace: string
}

export default ({ namespace = LIBRARY_NAME[0] } = {} as ResolverOptions): ComponentResolver => ({
  type: 'component',
  resolve: (name: string) => {
    const prefixRegex = new RegExp(`^${namespace}[A-Z]`)

    if (!name.match(prefixRegex))
      return

    const partialName = name
      .replace(new RegExp(namespace, 'i'), '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .slice(1)

    return {
      importName: name,
      from: `${LIBRARY_NAME}/components/${partialName}/index.js`,
      sideEffects: [],
    }
  },
})
