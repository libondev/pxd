import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Material from '../../src/components/material/index.vue'

describe('material', () => {
  it('renders properly', async () => {
    const wrapper = mount(Material, {
      props: {
        variant: 'default',
      },
    })

    expect(wrapper.classes()).toContain('pxd-material')
    expect(wrapper.classes()).toContain('default')

    wrapper.unmount()
  })

  it('renders small variant', async () => {
    const wrapper = mount(Material, {
      props: {
        variant: 'small',
      },
    })

    expect(wrapper.classes()).toContain('pxd-material')
    expect(wrapper.classes()).toContain('small')

    wrapper.unmount()
  })
})
