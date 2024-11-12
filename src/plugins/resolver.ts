import type { ComponentResolver } from 'unplugin-vue-components'
import { name } from '../../package.json'

const NAMESPACE = name[0].toUpperCase()

// eslint-disable-next-line node/prefer-global/process
const LIBRARY_NAME = process.env.NODE_ENV === 'development' ? '@/' : name

export default (): ComponentResolver => ({
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
      from: `${LIBRARY_NAME}/components/${partialName}/index`,
      sideEffects: [],
    }
  },
})
