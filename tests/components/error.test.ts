import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Error from '../../src/components/error/index.vue'

describe('error', () => {
  it('render default', () => {
    const wrapper = mount(Error, {
      slots: {
        default: 'This email address is already in use.',
      },
    })

    expect(wrapper.find('.pxd-error').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('This email address is already in use.')

    wrapper.unmount()
  })

  it('should render label', async () => {
    const wrapper = mount(Error, {
      props: {
        label: 'Error',
      },
    })

    expect(wrapper.find('b').exists()).toBe(true)
    expect(wrapper.find('b').text()).toBe('Error:')

    // 测试 error.label
    await wrapper.setProps({
      label: undefined,
      error: { label: 'Validation Error', message: 'This email address is already in use.' },
    })
    expect(wrapper.find('b').text()).toBe('Validation Error:')

    wrapper.unmount()
  })

  it('should render with action and link', () => {
    const wrapper = mount(Error, {
      props: {
        error: {
          message: 'File not found',
          action: 'View Documentation',
          link: '/docs',
        },
      },
    })

    expect(wrapper.text()).toContain('File not found')
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').text()).toContain('View Documentation')
    expect(wrapper.find('a').attributes('href')).toBe('/docs')
    expect(wrapper.find('a').attributes('target')).toBe('_self')

    wrapper.unmount()
  })

  it('should render external link', () => {
    const wrapper = mount(Error, {
      props: {
        error: {
          message: 'Need more information',
          action: 'Visit Help Center',
          link: 'https://example.com/help',
        },
      },
    })

    expect(wrapper.find('a').attributes('target')).toBe('_blank')
    expect(wrapper.find('a svg').exists()).toBe(true)

    wrapper.unmount()
  })
})
