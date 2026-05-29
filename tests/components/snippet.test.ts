import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Snippet from '../../src/components/snippet/index.vue'

describe('snippet', () => {
  it('renders properly', () => {
    const wrapper = mount(Snippet)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render text content via prop', () => {
    const wrapper = mount(Snippet, {
      props: {
        text: 'npm install pxd',
      },
    })

    expect(wrapper.text()).toContain('npm install pxd')

    wrapper.unmount()
  })

  it('should default prompt to "$ "', () => {
    const wrapper = mount(Snippet)

    expect(wrapper.props('prompt')).toBe('$ ')

    wrapper.unmount()
  })

  it('should accept custom prompt', () => {
    const wrapper = mount(Snippet, {
      props: {
        prompt: '> ',
      },
    })

    expect(wrapper.props('prompt')).toBe('> ')

    wrapper.unmount()
  })

  it('should default variant to default', () => {
    const wrapper = mount(Snippet)

    expect(wrapper.props('variant')).toBe('default')

    wrapper.unmount()
  })
})
