import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Bubble from '../../src/components/bubble/index.vue'

describe('bubble', () => {
  it('renders properly', () => {
    const wrapper = mount(Bubble)

    expect(wrapper.find('article').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render with system role by default', () => {
    const wrapper = mount(Bubble)

    expect(wrapper.attributes('data-role')).toBe('system')

    wrapper.unmount()
  })

  it('should render with user role', () => {
    const wrapper = mount(Bubble, {
      props: {
        role: 'user',
      },
    })

    expect(wrapper.attributes('data-role')).toBe('user')

    wrapper.unmount()
  })

  it('should render text content', () => {
    const wrapper = mount(Bubble, {
      props: {
        text: 'Hello world',
      },
    })

    expect(wrapper.text()).toContain('Hello world')

    wrapper.unmount()
  })

  it('should render header', () => {
    const wrapper = mount(Bubble, {
      props: {
        header: 'Header text',
      },
    })

    expect(wrapper.text()).toContain('Header text')

    wrapper.unmount()
  })

  it('should render avatar', () => {
    const wrapper = mount(Bubble, {
      props: {
        avatar: 'https://example.com/avatar.png',
      },
    })

    expect(wrapper.find('[data-bubble-avatar]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Bubble, {
      slots: {
        default: 'Custom content',
      },
    })

    expect(wrapper.text()).toContain('Custom content')

    wrapper.unmount()
  })

  it('should render footer slot', () => {
    const wrapper = mount(Bubble, {
      slots: {
        footer: 'Footer content',
      },
    })

    expect(wrapper.text()).toContain('Footer content')

    wrapper.unmount()
  })
})
