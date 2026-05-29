import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ProjectBanner from '../../src/components/project-banner/index.vue'

describe('project-banner', () => {
  it('renders properly', () => {
    const wrapper = mount(ProjectBanner)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(ProjectBanner, {
      slots: {
        default: '<span>Banner content</span>',
      },
    })

    expect(wrapper.text()).toContain('Banner content')

    wrapper.unmount()
  })
})
