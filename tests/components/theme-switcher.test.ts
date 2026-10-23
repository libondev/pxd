import DeviceAlternateIcon from '@gdsicon/vue/device-alternate'
import MoonIcon from '@gdsicon/vue/moon'
import SunIcon from '@gdsicon/vue/sun'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import ThemeSwitcher from '../../src/components/theme-switcher/index.vue'

let originalMatchMedia: typeof window.matchMedia

function stubSystemScheme(dark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: dark,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('theme-switcher', () => {
  beforeEach(() => {
    localStorage.clear()
    originalMatchMedia = window.matchMedia
    stubSystemScheme(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.matchMedia = originalMatchMedia
  })

  it('should toggle between auto and inverted when clicked', async () => {
    const wrapper = mount(ThemeSwitcher)

    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted().toggle).toEqual([['inverted'], ['auto']])

    wrapper.unmount()
  })

  it('should show the device icon in auto mode', () => {
    const wrapper = mount(ThemeSwitcher)

    expect(wrapper.findComponent(DeviceAlternateIcon).exists()).toBe(true)

    wrapper.unmount()
  })

  it('should show the moon icon when inverted on a light system', () => {
    localStorage.setItem('fe.system.color-scheme', 'inverted')
    const wrapper = mount(ThemeSwitcher)

    expect(wrapper.findComponent(MoonIcon).exists()).toBe(true)

    wrapper.unmount()
  })

  it('should show the sun icon when inverted on a dark system', () => {
    stubSystemScheme(true)
    localStorage.setItem('fe.system.color-scheme', 'inverted')
    const wrapper = mount(ThemeSwitcher)

    expect(wrapper.findComponent(SunIcon).exists()).toBe(true)

    wrapper.unmount()
  })
})
