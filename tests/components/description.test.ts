import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Description from '../../src/components/description/index.vue'

describe('description', () => {
  it('should render properly', () => {
    const wrapper = mount(Description, {
      props: {
        title: 'Title',
        content: 'Content',
      },
    })

    expect(wrapper.find('.pxd-description--title').text()).toBe('Title')
    expect(wrapper.find('.pxd-description--content').text()).toBe('Content')

    wrapper.unmount()
  })
})
