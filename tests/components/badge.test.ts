import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Badge from '../../src/components/badge/index.vue'

describe('badge', () => {
  it('renders properly', () => {
    const wrapper = mount(Badge, {
      slots: {
        default: 'Hello PXD!',
      },
    })

    expect(wrapper.text()).toContain('Hello PXD!')

    wrapper.unmount()
  })

  it('should variant equal vue', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'vue',
      },
    })

    const classes = wrapper.classes()
    expect(classes).toContain('from-[#42d392]')
    expect(classes).toContain('via-[#42d392]')
    expect(classes).toContain('to-[#647eff]')

    wrapper.unmount()
  })
})
