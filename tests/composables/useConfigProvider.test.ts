import { describe, expect, it } from 'vitest'
import { injectionKey, useConfigProvider } from '../../src/composables/useConfigProvider'
import { useInjectedSetup } from '../helpers/provide-inject'

describe('useConfigProvider', () => {
  it('should return the config provider', () => {
    const wrapper = useInjectedSetup(
      useConfigProvider,
      [{ key: injectionKey, value: { size: 'sm' } }],
    )

    expect(wrapper.size).toBe('sm')

    wrapper.unmount()
  })
})
