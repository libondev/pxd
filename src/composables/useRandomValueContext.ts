import { inject, provide } from 'vue'
import { getRandomKey } from '../utils/random'

export function provideRandomValue(provideKey: string = 'randomValue') {
  const randomKey = getRandomKey()

  provide(provideKey, randomKey)

  return randomKey
}

export function useRandomValue(provideKey: string = 'randomValue') {
  const injectedValue = inject(provideKey, getRandomKey())

  return injectedValue
}
