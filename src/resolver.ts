import type { ComponentResolver, SideEffectsInfo } from 'unplugin-vue-components'

const LIBRARY_NAME = 'pxd'
const STYLELESS = ['provider']

function getSideEffects (name: string): SideEffectsInfo | undefined {
  if (STYLELESS.includes(name)) return

  return [`${LIBRARY_NAME}/_styles/base.css`, `pxd/_styles/${name}.css`]
}

export default (): ComponentResolver => ({
  type: 'component',
  resolve: (name: string) => {
    if (!name.match(/^Px[A-Z]/)) { return }

    const partialName = name.replace(/^Px/, '').toLowerCase()

    return {
      importName: name,
      from: `${LIBRARY_NAME}/${partialName}`,
      sideEffects: getSideEffects(partialName)
    }
  }
})
