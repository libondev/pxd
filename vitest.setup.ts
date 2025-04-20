import { afterAll, beforeAll, beforeEach } from 'vitest'

beforeAll(() => {
  globalThis.something = 'something'
})

beforeAll(async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, 300)
  })
})

beforeEach(async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, 10)
  })
})

afterAll(() => {
  delete globalThis.something
})

afterAll(async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, 500)
  })
})
