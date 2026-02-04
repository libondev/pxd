import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Toggle from '../../src/components/toggle/index.vue'

describe('toggle', () => {
  it('renders properly with default values', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false,
      },
    })
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect((wrapper.find('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(false)

    wrapper.unmount()
  })

  it('toggles state when clicked', async () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false,
      },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)

    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([true])

    wrapper.unmount()
  })

  it('displays custom active and inactive values correctly', async () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: 'inactive',
        activeValue: 'active',
        inactiveValue: 'inactive',
      },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)

    expect(wrapper.emitted()['update:modelValue'][0]).toEqual(['active'])

    wrapper.unmount()
  })

  it('renders labels properly', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false,
        activeLabel: 'on',
        inactiveLabel: 'off',
      },
    })

    const labels = wrapper.findAll('.pxd-toggle--label')
    expect(labels.length).toBe(2)
    expect(labels[0].text()).toBe('off')
    expect(labels[1].text()).toBe('on')

    wrapper.unmount()
  })

  it('applies correct CSS classes based on size prop', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false,
        size: 'lg',
      },
    })

    expect(wrapper.find('.pxd-toggle--handle').classes()).toContain('w-11')
    expect(wrapper.find('.pxd-toggle--handle').classes()).toContain('h-6')

    wrapper.unmount()
  })
})
