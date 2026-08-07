import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
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

  it('should delegate navigation keys from the input to the list', async () => {
    const wrapper = mount(CommandMenu, {
      props: {
        modelValue: true,
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
    })

    await vi.waitFor(() => expect(document.body.querySelector('input')).not.toBeNull())
    await vi.waitFor(() =>
      expect(document.body.querySelectorAll('[data-list-item]')).toHaveLength(2),
    )
    await vi.waitFor(() =>
      expect(document.body.querySelector('[data-list-item]')?.getAttribute('aria-selected')).toBe(
        'true',
      ),
    )

    const input = document.body.querySelector('input') as HTMLInputElement
    const items = document.body.querySelectorAll<HTMLElement>('[data-list-item]')
    expect(items[0]?.getAttribute('aria-selected')).toBe('true')

    input.focus()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }))
    await nextTick()

    expect(items[1]?.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(input)

    wrapper.unmount()
  })
})
