import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ThemeSwitcher from '../../src/components/theme-switcher/index.vue'

describe('theme-switcher', () => {
  it('should emit toggle event when button is clicked', async () => {
    const wrapper = mount(ThemeSwitcher)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted().toggle).toBeTruthy()
    expect(wrapper.emitted().toggle[0]).toEqual(['light'])

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted().toggle[1]).toEqual(['dark'])

    wrapper.unmount()
  })
})
