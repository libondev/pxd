import type { ComponentResolver } from 'unplugin-vue-components'

const LIBRARY_NAME = 'pxd'

const NAMESPACE = LIBRARY_NAME[0].toUpperCase()

function resolver(): ComponentResolver {
  const prefixRegex = /^P[A-Z]/

  return {
    type: 'component',
    resolve(name: string) {
      if (!prefixRegex.test(name)) {
        return
      }

      const partialName = name
        .replace(new RegExp(NAMESPACE, 'i'), '')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .slice(1)

      return {
        name: 'default',
        as: name,
        from: `pxd/components/${partialName}`,
      }
    },
  }
}

export default resolver
