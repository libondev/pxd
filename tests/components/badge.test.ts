import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Badge from '../../src/components/badge/index.vue'

describe('badge', () => {
  it('renders properly', () => {
    const wrapper = mount(Badge, {
      slots: {
        default: 'Hello PXD!',
      },
    })

    expect(wrapper.text()).toContain('Hello PXD!')
    expect(wrapper.element.tagName).toBe('SPAN')

    wrapper.unmount()
  })

  it('should variant equal vue', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'vue',
      },
    })

    const classes = wrapper.classes()
    expect(classes).toContain('vue')

    wrapper.unmount()
  })

  it('should render as a tag', () => {
    const wrapper = mount(Badge, {
      props: {
        as: 'a',
      },
    })

    expect(wrapper.element.tagName).toBe('A')

    wrapper.unmount()
  })
})
