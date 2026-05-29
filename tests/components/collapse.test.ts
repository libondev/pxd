import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Collapse from '../../src/components/collapse/index.vue'

describe('collapse', () => {
  it('renders properly', () => {
    const wrapper = mount(Collapse)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render title', () => {
    const wrapper = mount(Collapse, {
      props: {
        title: 'Click to expand',
      },
    })

    expect(wrapper.text()).toContain('Click to expand')

    wrapper.unmount()
  })

  it('should emit toggle event on click', async () => {
    const wrapper = mount(Collapse, {
      props: {
        title: 'Toggle me',
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('toggle')

    wrapper.unmount()
  })

  it('should render default slot content', () => {
    const wrapper = mount(Collapse, {
      slots: {
        default: '<p>Hidden content</p>',
      },
    })

    expect(wrapper.text()).toContain('Hidden content')

    wrapper.unmount()
  })
})
