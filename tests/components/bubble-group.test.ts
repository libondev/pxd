import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import BubbleGroup from '../../src/components/bubble-group/index.vue'

describe('bubble-group', () => {
  it('renders properly', () => {
    const wrapper = mount(BubbleGroup)

    expect(wrapper.find('.pxd-bubble-group').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(BubbleGroup, {
      slots: {
        default: '<div>Messages</div>',
      },
    })

    expect(wrapper.text()).toContain('Messages')

    wrapper.unmount()
  })
})
