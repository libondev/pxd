import type { ComponentResolver, SideEffectsInfo } from 'unplugin-vue-components'

const STYLELESS = ['provider', 'spinner']

function getSideEffects (name: string): SideEffectsInfo | undefined {
  console.log('getSideEffects', name)

  if (STYLELESS.includes(name)) return

  return ['/carbons/_styles/base.css', `/carbons/_styles/${name}.css`]
}

export default function CarbonsResolver (): ComponentResolver {
  return {
    type: 'component',
    resolve: (name: string) => {
      if (name.match(/^C[A-Z]/)) {
        const partialName = name.replace(/^C/, '').toLowerCase()

        return {
          importName: name,
          from: `/carbons/${partialName}`,
          sideEffects: getSideEffects(partialName)
        }
      }
    }
  }
}
