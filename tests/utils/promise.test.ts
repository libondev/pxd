import { afterEach, describe, expect, it } from 'vite-plus/test'
import { withResolvers } from '../../src/utils/_internal/promise'

const nativeDescriptor = Object.getOwnPropertyDescriptor(Promise, 'withResolvers')

afterEach(() => {
  if (nativeDescriptor) {
    Object.defineProperty(Promise, 'withResolvers', nativeDescriptor)
  }
})

describe('withResolvers', () => {
  it('settles outside the executor scope', async () => {
    const { promise, resolve } = withResolvers<number>()

    resolve(1)

    await expect(promise).resolves.toBe(1)
  })

  it('rejects through the exposed reject', async () => {
    const { promise, reject } = withResolvers<number>()
    const error = new Error('boom')

    reject(error)

    await expect(promise).rejects.toBe(error)
  })

  it('falls back when Promise.withResolvers is missing', async () => {
    Reflect.deleteProperty(Promise, 'withResolvers')

    const { promise, resolve } = withResolvers<number>()

    resolve(2)

    await expect(promise).resolves.toBe(2)
  })
})
