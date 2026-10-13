import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ThemeSwitcher from '../../src/components/theme-switcher/index.vue'

describe('theme-switcher', () => {
  it('should cycle through system, light and dark when clicked', async () => {
    const wrapper = mount(ThemeSwitcher)

    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted().toggle).toEqual([['light'], ['dark'], ['auto']])

    wrapper.unmount()
  })
})
