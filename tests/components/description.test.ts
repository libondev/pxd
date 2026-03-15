import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Description from '../../src/components/description/index.vue'

describe('description', () => {
  it('should render properly', () => {
    const wrapper = mount(Description, {
      props: {
        title: 'Title',
        description: 'Content',
      },
    })

    expect(wrapper.find('.pxd-description--title').text()).toBe('Title')
    expect(wrapper.find('.pxd-description--description').text()).toBe('Content')

    wrapper.unmount()
  })
})
