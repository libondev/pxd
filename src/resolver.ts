import type { ComponentResolver, SideEffectsInfo } from 'unplugin-vue-components'

const LIBRARY_NAME = 'px-ui'
const STYLELESS = ['provider']

function getSideEffects (name: string): SideEffectsInfo | undefined {
  if (STYLELESS.includes(name)) return

  return [`${LIBRARY_NAME}/_styles/base.css`, `px-ui/_styles/${name}.css`]
}

export default function PxResolver (): ComponentResolver {
  return {
    type: 'component',
    resolve: (name: string) => {
      if (!name.match(/^C[A-Z]/)) { return }

      const partialName = name.replace(/^C/, '').toLowerCase()

      return {
        importName: name,
        from: `${LIBRARY_NAME}/${partialName}`,
        sideEffects: getSideEffects(partialName)
      }
    }
  }
}
