import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import CommandMenu from '../../src/components/command-menu/index.vue'

describe('command-menu', () => {
  it('renders properly', () => {
    const wrapper = mount(CommandMenu)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default modelValue to false', () => {
    const wrapper = mount(CommandMenu)

    expect(wrapper.props('modelValue')).toBe(false)

    wrapper.unmount()
  })

  it('should accept placeholder', () => {
    const wrapper = mount(CommandMenu, {
      props: {
        placeholder: 'Search...',
      },
    })

    expect(wrapper.props('placeholder')).toBe('Search...')

    wrapper.unmount()
  })

  it('should accept options prop', () => {
    const wrapper = mount(CommandMenu, {
      props: {
        options: [
          {
            type: 'group',
            label: 'Group',
            options: [{ label: 'Item 1', value: '1' }],
          },
        ],
      },
    })

    expect(wrapper.props('options')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should default closeOnSelectItem to true', () => {
    const wrapper = mount(CommandMenu)

    expect(wrapper.props('closeOnSelectItem')).toBe(true)

    wrapper.unmount()
  })

  it('should default closeOnPressEscape to true', () => {
    const wrapper = mount(CommandMenu)

    expect(wrapper.props('closeOnPressEscape')).toBe(true)

    wrapper.unmount()
  })
})
