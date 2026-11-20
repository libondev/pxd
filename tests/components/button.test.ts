import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Button from '../../src/components/button/index.vue'

describe('button', () => {
  it('renders properly', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Hello PXD!',
      },
    })

    expect(wrapper.text()).toContain('Hello PXD!')

    wrapper.unmount()
  })

  it('renders text when no default slot is provided', () => {
    const wrapper = mount(Button, {
      props: {
        text: 'Save',
      },
    })

    expect(wrapper.text()).toBe('Save')

    wrapper.unmount()
  })

  it('prefers the default slot over text', () => {
    const wrapper = mount(Button, {
      props: {
        text: 'Save',
      },
      slots: {
        default: 'Submit',
      },
    })

    expect(wrapper.text()).toBe('Submit')

    wrapper.unmount()
  })

  it('renders a numeric text value', () => {
    const wrapper = mount(Button, {
      props: {
        text: 0,
      },
    })

    expect(wrapper.text()).toBe('0')

    wrapper.unmount()
  })

  it('should render an default button', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'default',
      },
    })

    expect(wrapper.attributes('data-variant')).toBe('default')

    wrapper.unmount()
  })

  it('should emit a click event when clicked', async () => {
    const wrapper = mount(Button)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')

    wrapper.unmount()
  })

  it('replaces the icon with a spinner when loading', async () => {
    const wrapper = mount(Button, {
      props: {
        icon: true,
      },
      slots: {
        default: 'Icon',
      },
    })

    expect(wrapper.findAll('[data-spinner]')).toHaveLength(0)
    expect(wrapper.text()).toBe('Icon')

    await wrapper.setProps({ loading: true })

    expect(wrapper.findAll('[data-spinner]')).toHaveLength(1)
    expect(wrapper.text()).toBe('')

    wrapper.unmount()
  })

  it('keeps the label and shows a spinner when loading', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true,
      },
      slots: {
        default: 'Save',
      },
    })

    expect(wrapper.findAll('[data-spinner]')).toHaveLength(1)
    expect(wrapper.text()).toBe('Save')

    wrapper.unmount()
  })

  it('should render as a div when set as prop', async () => {
    const wrapper = mount(Button, {
      props: {
        as: 'div',
      },
    })

    expect(wrapper.element.tagName).toBe('DIV')

    wrapper.unmount()
  })
})
