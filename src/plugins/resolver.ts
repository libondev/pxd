import type { ComponentResolver } from 'unplugin-vue-components'

const LIBRARY_NAME = 'pxd'

export default (): ComponentResolver => ({
  type: 'component',
  resolve: (name: string) => {
    if (!name.match(/^Px[A-Z]/)) { return }

    const partialName = name.replace(/^Px/, '').replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)

    return {
      importName: name,
      from: `${LIBRARY_NAME}/${partialName}/index.js`,
      sideEffects: []
    }
  }
})
