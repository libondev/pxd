import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Description from '../../src/components/description/index.vue'
import PTooltip from '../../src/components/tooltip/index.vue'

describe('description', () => {
  it('should render properly', () => {
    const wrapper = mount(Description, {
      props: {
        title: 'Title',
        description: 'Content',
      },
    })

    expect(wrapper.find('.pxd-description--title').text()).toBe('Title')
    expect(wrapper.find('.pxd-description--description').text()).toBe('Content')

    wrapper.unmount()
  })

  it('should prefer title and description slots over props', () => {
    const wrapper = mount(Description, {
      props: {
        title: 'Prop Title',
        description: 'Prop Description',
      },
      slots: {
        title: 'Slot Title',
        description: 'Slot Description',
      },
    })

    expect(wrapper.find('.pxd-description--title').text()).toBe('Slot Title')
    expect(wrapper.find('.pxd-description--description').text()).toBe('Slot Description')

    wrapper.unmount()
  })

  it('should render a tooltip when tooltip prop is set', () => {
    const wrapper = mount(Description, {
      props: {
        title: 'Title',
        tooltip: 'Tooltip Content',
      },
    })

    const tooltip = wrapper.findComponent(PTooltip)
    expect(tooltip.exists()).toBe(true)
    expect(tooltip.props('content')).toBe('Tooltip Content')

    wrapper.unmount()
  })

  it('should not render a tooltip without the tooltip prop', () => {
    const wrapper = mount(Description, {
      props: {
        title: 'Title',
      },
    })

    expect(wrapper.findComponent(PTooltip).exists()).toBe(false)

    wrapper.unmount()
  })

  it('should pass through attrs', () => {
    const wrapper = mount(Description, {
      attrs: {
        id: 'my-description',
      },
    })

    expect(wrapper.attributes('id')).toBe('my-description')

    wrapper.unmount()
  })
})
