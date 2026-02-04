import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PLoadingDots from '../../src/components/loading-dots/index.vue'

describe('loading-dots', () => {
  it('without slots', () => {
    const wrapper = mount(PLoadingDots)

    expect(wrapper.findAll('.pxd-loading--dot').length).toBe(3)

    expect(wrapper.find('.pxd-loading-dots--text').exists()).toBe(false)

    wrapper.unmount()
  })

  it('with both slots', () => {
    const wrapper = mount(PLoadingDots, {
      slots: {
        prefix: '<span>loading</span>',
        suffix: '<span>please wait</span>',
      },
    })

    const slots = wrapper.findAll('.pxd-loading-dots--text')
    expect(slots.length).toBe(2)

    expect(slots[0].text()).toBe('loading')
    expect(slots[1].text()).toBe('please wait')

    wrapper.unmount()
  })
})
