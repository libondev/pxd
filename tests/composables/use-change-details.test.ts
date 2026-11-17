import { describe, expect, it } from 'vite-plus/test'
import {
  changeDetailsFor,
  withChangeDetails,
} from '../../src/composables/_internal/use-change-details'

describe('withChangeDetails', () => {
  it('should restore the cause after a synchronous call', () => {
    withChangeDetails({ source: 'agent' }, () => undefined)

    expect(changeDetailsFor().source).toBeUndefined()
  })

  it('should keep the cause until an async call settles', async () => {
    let during: string | undefined

    await withChangeDetails({ source: 'agent' }, async () => {
      await Promise.resolve()
      during = changeDetailsFor({ reason: 'api' }).source as string | undefined
    })

    expect(during).toBe('agent')
    expect(changeDetailsFor().source).toBeUndefined()
  })

  it('should restore the cause when an async call throws', async () => {
    await expect(
      withChangeDetails({ source: 'agent' }, async () => {
        await Promise.resolve()
        throw new Error('failed')
      }),
    ).rejects.toThrow('failed')

    expect(changeDetailsFor().source).toBeUndefined()
  })

  it('should let a nested call restore the outer cause', async () => {
    await withChangeDetails({ source: 'agent' }, async () => {
      await withChangeDetails({ source: 'programmatic' }, async () => {
        await Promise.resolve()
        expect(changeDetailsFor({ reason: 'api' }).source).toBe('programmatic')
      })

      expect(changeDetailsFor({ reason: 'api' }).source).toBe('agent')
    })
  })
})
