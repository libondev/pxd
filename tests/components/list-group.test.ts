import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ListGroup from '../../src/components/list-group/index.vue'

describe('list-group', () => {
  it('renders properly', () => {
    const wrapper = mount(ListGroup, {
      props: {
        label: 'Group',
      },
    })

    expect(wrapper.find('.pxd-list-group').exists()).toBe(true)
    expect(wrapper.text()).toContain('Group')

    wrapper.unmount()
  })

  it('should pass through attrs', () => {
    const wrapper = mount(ListGroup, {
      attrs: {
        id: 'my-group',
      },
    })

    expect(wrapper.find('.pxd-list-group').attributes('id')).toBe('my-group')
    expect(wrapper.find('.pxd-list-group').attributes('role')).toBe('group')

    wrapper.unmount()
  })
})
