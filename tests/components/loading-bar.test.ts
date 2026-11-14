import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import LoadingBar from '../../src/components/loading-bar/index.vue'
import { useLoadingBar } from '../../src/composables/use-loading-bar'

describe('loading-bar', () => {
  it('renders properly', () => {
    const wrapper = mount(LoadingBar)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default group to default', () => {
    const wrapper = mount(LoadingBar)

    expect(wrapper.props('group')).toBe('default')

    wrapper.unmount()
  })

  it('should accept custom group', () => {
    const wrapper = mount(LoadingBar, {
      props: {
        group: 'custom',
      },
    })

    expect(wrapper.props('group')).toBe('custom')

    wrapper.unmount()
  })

  it('should default trickle to true', () => {
    const wrapper = mount(LoadingBar)

    expect(wrapper.props('trickle')).toBe(true)

    wrapper.unmount()
  })

  describe('trickle', () => {
    beforeEach(() => {
      vi.useFakeTimers({
        toFake: [
          'setTimeout',
          'clearTimeout',
          'requestAnimationFrame',
          'cancelAnimationFrame',
          'performance',
          'Date',
        ],
      })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should grow gradually instead of jumping to the cap', async () => {
      const wrapper = mount(LoadingBar, { props: { trickle: true } })

      useLoadingBar.start()
      await vi.advanceTimersByTimeAsync(400)

      const inner = document.querySelector<HTMLElement>('.pxd-loading-bar--inner')
      const scale = Number(/scaleX\(([^)]+)\)/.exec(inner?.style.transform ?? '')?.[1])

      expect(scale).toBeGreaterThan(0.08)
      expect(scale).toBeLessThan(0.5)

      wrapper.unmount()
    })
  })
})
