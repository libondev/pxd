import { inject, provide } from 'vue'

const getRandomValue = () => `P${Math.random()}`

export function provideRandomValue(provideKey: string = 'randomValue') {
  const randomValue = getRandomValue()

  provide(provideKey, randomValue)

  return randomValue
}

export function useRandomValue(provideKey: string = 'randomValue') {
  const randomValue = inject(provideKey, getRandomValue())

  return randomValue
}
