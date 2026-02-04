import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

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

  it('should render an default button', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'default',
      },
    })

    const classes = wrapper.classes()
    expect(classes).toContain('bg-background-100')
    expect(classes).toContain('text-foreground')
    expect(classes).toContain('border-input')

    wrapper.unmount()
  })

  it('should emit a click event when clicked', async () => {
    const wrapper = mount(Button)

    wrapper.find('button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')

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
