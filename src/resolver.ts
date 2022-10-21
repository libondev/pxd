import type { ComponentResolver, SideEffectsInfo } from 'unplugin-vue-components'

const STYLELESS = ['provider']

function getSideEffects (name: string): SideEffectsInfo | undefined {
  if (STYLELESS.includes(name)) return

  return ['carbons/_styles/base.css', `carbons/_styles/${name}.css`]
}

export default function CarbonsResolver (): ComponentResolver {
  return {
    type: 'component',
    resolve: (name: string) => {
      if (!name.match(/^C[A-Z]/)) { return }

      const partialName = name.replace(/^C/, '').toLowerCase()

      return {
        importName: name,
        from: `carbons/${partialName}`,
        sideEffects: getSideEffects(partialName)
      }
    }
  }
}
