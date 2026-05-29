import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Label from '../../src/components/label/index.vue'

describe('label', () => {
  it('renders properly', () => {
    const wrapper = mount(Label, {
      slots: {
        default: 'Label text',
      },
    })

    expect(wrapper.find('label').exists()).toBe(true)
    expect(wrapper.text()).toContain('Label text')

    wrapper.unmount()
  })

  it('should render as label element', () => {
    const wrapper = mount(Label)

    expect(wrapper.element.tagName).toBe('LABEL')

    wrapper.unmount()
  })
})
