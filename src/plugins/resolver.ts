import type { ComponentResolver } from 'unplugin-vue-components'
import { name } from '../../package.json'

const DEFAULT_NAMESPACE = name[0].toUpperCase()

// eslint-disable-next-line node/prefer-global/process
const LIBRARY_NAME = process.env.NODE_ENV === 'development' ? './' : name

interface ResolverOptions {
  /**
   * Replaces the component prefix used for automatic import.
   * @default 'P'
   */
  namespace: string
}

export default ({ namespace = DEFAULT_NAMESPACE } = {} as ResolverOptions): ComponentResolver => ({
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
      from: `${LIBRARY_NAME}/components/${partialName}/index`,
      sideEffects: [],
    }
  },
})
