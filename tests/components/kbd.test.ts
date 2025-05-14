import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Kbd from '../../src/components/kbd/index.vue'

describe('kbd', () => {
  it('renders properly', async () => {
    const wrapper = mount(Kbd, {
      props: {
        ctrl: true,
      },
    })

    expect(wrapper.text()).toBe('Ctrl')

    wrapper.unmount()
  })

  it('custom label', async () => {
    const wrapper = mount(Kbd, {
      slots: {
        default: 'custom label',
      },
    })

    expect(wrapper.text()).toBe('custom label')

    wrapper.unmount()
  })
})
