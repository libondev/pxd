import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ThemeSwitcher from '../../src/components/theme-switcher/index.vue'

describe('theme-switcher', () => {
  it('should emit toggle event when button is clicked', async () => {
    const wrapper = mount(ThemeSwitcher)

    await wrapper.find('button').trigger('click')

    const emitted = wrapper.emitted()
    expect(emitted.toggle).toBeTruthy()
    expect(emitted.toggle?.[0]).toEqual(['dark'])

    await wrapper.find('button').trigger('click')

    expect(emitted.toggle?.[1]).toEqual(['light'])

    wrapper.unmount()
  })
})
