import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Material from '../../src/components/material/index.vue'

describe('material', () => {
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
