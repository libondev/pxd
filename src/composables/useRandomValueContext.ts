import { inject, provide } from 'vue'
import { getRandomId } from '../utils/random'

export function provideRandomValue(provideKey: string = 'randomValue') {
  const randomValue = getRandomId()

  provide(provideKey, randomValue)

  return randomValue
}

export function useRandomValue(provideKey: string = 'randomValue') {
  const randomValue = inject(provideKey, getRandomId())

  return randomValue
}
