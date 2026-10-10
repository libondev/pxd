import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Material from '../../src/components/material/index.vue'

describe('material', () => {
  // The component exists only to wrap content in a variant class, so that class is the contract.
  it('renders properly', async () => {
    const wrapper = mount(Material, {
      props: {
        variant: 'default',
      },
    })

    expect(wrapper.classes()).toContain('pxd-material')
    expect(wrapper.classes()).toContain('shadow-border-base')

    wrapper.unmount()
  })

  it('renders small variant', async () => {
    const wrapper = mount(Material, {
      props: {
        variant: 'small',
      },
    })

    expect(wrapper.classes()).toContain('pxd-material')
    expect(wrapper.classes()).toContain('shadow-border-small')

    wrapper.unmount()
  })
})
