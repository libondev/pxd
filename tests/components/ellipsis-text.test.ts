import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import EllipsisText from '../../src/components/ellipsis-text/index.vue'

describe('ellipsis-text', () => {
  it('renders properly', () => {
    const wrapper = mount(EllipsisText, {
      props: {
        text: 'Short text',
      },
    })

    expect(wrapper.find('.pxd-ellipsis-text').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render text content', () => {
    const wrapper = mount(EllipsisText, {
      props: {
        text: 'Hello World',
      },
    })

    expect(wrapper.text()).toContain('Hello World')

    wrapper.unmount()
  })

  it('should default rows to 1', () => {
    const wrapper = mount(EllipsisText, {
      props: {
        text: 'Text',
      },
    })

    expect(wrapper.props('rows')).toBe(1)

    wrapper.unmount()
  })

  it('should accept custom dots', () => {
    const wrapper = mount(EllipsisText, {
      props: {
        text: 'Text',
        dots: '---',
      },
    })

    expect(wrapper.props('dots')).toBe('---')

    wrapper.unmount()
  })

  it('should default position to end', () => {
    const wrapper = mount(EllipsisText, {
      props: {
        text: 'Text',
      },
    })

    expect(wrapper.props('position')).toBe('end')

    wrapper.unmount()
  })
})
