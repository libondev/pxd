import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Note from '../../src/components/note/index.vue'

describe('note', () => {
  it('should render properly', () => {
    const wrapper = mount(Note, {
      slots: {
        default: 'test',
      },
    })

    expect(wrapper.text()).toBe('test')

    wrapper.unmount()
  })

  it('should render label', () => {
    const wrapper = mount(Note, {
      slots: {
        label: 'label',
      },
    })

    expect(wrapper.text()).toBe('label')

    wrapper.unmount()
  })

  it('should render action', () => {
    const wrapper = mount(Note, {
      slots: {
        action: 'action',
      },
    })

    expect(wrapper.text()).toBe('action')

    wrapper.unmount()
  })
})
