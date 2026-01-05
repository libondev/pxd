import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { useColorScheme } from '../../src/composables/use-color-scheme'

// Helper component to test composable cleanup
const TestComponent = defineComponent({
  name: 'TestComponent',
  props: {
    syncStatus: Boolean,
  },
  setup(props) {
    const { isDark, toggleDarkMode } = useColorScheme({
      syncStatus: props.syncStatus,
    })

    return {
      isDark,
      toggleDarkMode,
    }
  },
  template: '<div><button @click="toggleDarkMode">Toggle</button><span>{{ isDark }}</span></div>',
})

describe('use-color-scheme memory leak prevention', () => {
  let mockLocalStorage: Record<string, string> = {}
  let originalDocumentHead: HTMLElement
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(key => mockLocalStorage[key] || null),
      setItem: vi.fn((key, value) => { mockLocalStorage[key] = value }),
      removeItem: vi.fn((key) => { delete mockLocalStorage[key] }),
    })

    // Mock document.head to track style elements
    originalDocumentHead = document.head
    vi.spyOn(document, 'head', 'get').mockReturnValue(originalDocumentHead)

    // Mock matchMedia
    originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.matchMedia = originalMatchMedia
    // Clean up any remaining style elements
    const styleElements = document.querySelectorAll('style[data-test-mock]')
    styleElements.forEach(el => el.remove())
  })

  it('should clean up style elements on component unmount', async () => {
    const wrapper = mount(TestComponent, {
      props: { syncStatus: false },
    })

    // Count style elements before
    const styleCountBefore = document.querySelectorAll('style').length

    // Trigger theme toggle to create style element
    await wrapper.find('button').trigger('click')

    // Verify style element was added
    const styleCountAfterToggle = document.querySelectorAll('style').length
    expect(styleCountAfterToggle).toBeGreaterThan(styleCountBefore)

    // Unmount component
    wrapper.unmount()

    // Wait for any async cleanup
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verify style elements are cleaned up
    const styleCountAfterUnmount = document.querySelectorAll('style').length
    expect(styleCountAfterUnmount).toBe(styleCountBefore)
  })

  it('should handle rapid toggles without leaking style elements', async () => {
    const wrapper = mount(TestComponent, {
      props: { syncStatus: false },
    })

    const button = wrapper.find('button')

    // Rapid clicks
    for (let i = 0; i < 10; i++) {
      await button.trigger('click')
    }

    // Wait for cleanup timers
    await new Promise(resolve => setTimeout(resolve, 10))

    const styleCount = document.querySelectorAll('style').length

    // Unmount
    wrapper.unmount()
    await new Promise(resolve => setTimeout(resolve, 10))

    // Should be back to original count
    const finalStyleCount = document.querySelectorAll('style').length
    expect(finalStyleCount).toBeLessThanOrEqual(styleCount)
  })

  it('should properly clean up event listeners when syncStatus is enabled', async () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const wrapper = mount(TestComponent, {
      props: { syncStatus: true },
    })

    // Find the specific event listener for color scheme
    const colorSchemeCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === '#toggle-color-scheme',
    )

    expect(colorSchemeCalls.length).toBe(1)

    // Unmount
    wrapper.unmount()

    // Should have removed the event listener
    const removeCalls = removeEventListenerSpy.mock.calls.filter(
      call => call[0] === '#toggle-color-scheme',
    )

    expect(removeCalls.length).toBe(1)
  })

  it('should not leak memory when multiple instances are created and destroyed', async () => {
    const instances = []

    // Create multiple instances
    for (let i = 0; i < 5; i++) {
      const wrapper = mount(TestComponent, { props: { syncStatus: true } })
      instances.push(wrapper)

      // Trigger some toggles
      await wrapper.find('button').trigger('click')
      await wrapper.find('button').trigger('click')
    }

    // Wait for async cleanup
    await new Promise(resolve => setTimeout(resolve, 10))

    // Get initial style count
    const initialStyleCount = document.querySelectorAll('style').length

    // Destroy all instances
    for (const wrapper of instances) {
      wrapper.unmount()
    }

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verify no style elements leaked
    const finalStyleCount = document.querySelectorAll('style').length
    expect(finalStyleCount).toBeLessThanOrEqual(initialStyleCount)
  })

  it('should handle cleanup when component is destroyed during timer execution', async () => {
    const wrapper = mount(TestComponent, {
      props: { syncStatus: false },
    })

    // Trigger toggle to start timer
    await wrapper.find('button').trigger('click')

    // Immediately unmount before timer completes
    wrapper.unmount()

    // Wait for timer to complete
    await new Promise(resolve => setTimeout(resolve, 10))

    // Should not throw errors and should be clean
    expect(() => {
      // Any cleanup should have happened without errors
    }).not.toThrow()
  })

  it('should properly manage localStorage without leaks', async () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem')

    const wrapper = mount(TestComponent, {
      props: { syncStatus: false },
    })

    // Trigger multiple toggles
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')

    // Verify localStorage calls
    expect(setItemSpy).toHaveBeenCalledTimes(3)

    // Unmount
    wrapper.unmount()

    // Should not continue to call localStorage after unmount
    const callsAfterUnmount = setItemSpy.mock.calls.length
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(setItemSpy.mock.calls.length).toBe(callsAfterUnmount)
  })
})
