import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import Browser from '../../src/components/browser/index.vue'

describe('browser', () => {
  it('renders properly', () => {
    const wrapper = mount(Browser, {
      props: {
        address: 'https://example.com',
      },
      slots: {
        default: '<div>page content</div>',
      },
    })

    expect(wrapper.classes()).toContain('pxd-browser')
    expect(wrapper.text()).toContain('https://example.com')
    expect(wrapper.text()).toContain('page content')

    wrapper.unmount()
  })

  it('should copy the address when the copy button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    const wrapper = mount(Browser, {
      props: {
        address: 'https://example.com',
      },
    })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledWith('https://example.com')

    wrapper.unmount()
  })
})
