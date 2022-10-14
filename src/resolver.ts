import type { ComponentResolver, SideEffectsInfo } from 'unplugin-vue-components'

function getSideEffects (): SideEffectsInfo | undefined {
  return undefined
}

export function CarbonResolver (): ComponentResolver {
  const resolver: ComponentResolver = {
    type: 'component',
    resolve: (name: string) => {
      if (name.match(/^C[A-Z]/)) {
        const partialName = name.replace(/^C/, '')

        return {
          importName: name,
          from: `carbons/${partialName}`,
          sideEffects: getSideEffects()
        }
      }
    }
  }

  return resolver
}
