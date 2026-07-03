import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ListGroup from '../../src/components/list-group/index.vue'

describe('list-group', () => {
  it('renders properly', () => {
    const wrapper = mount(ListGroup, {
      props: {
        label: 'Group',
      },
      slots: {
        default: '<div>Item</div>',
      },
    })

    expect(wrapper.find('.pxd-list-group').exists()).toBe(true)
    expect(wrapper.text()).toContain('Group')
    expect(wrapper.text()).toContain('Item')

    wrapper.unmount()
  })
})
