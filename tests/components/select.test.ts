import type { ListOption } from '../../src/components/list/types'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, nextTick, ref } from 'vue'
import Popover from '../../src/components/popover/index.vue'
import Select from '../../src/components/select/index.vue'
import { flushPopover } from '../helpers/flush-popover'

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]

function trigger() {
  return document.body.querySelector<HTMLElement>('[data-select]')!
}

describe('select', () => {
  it('renders properly', () => {
    const wrapper = mount(Select)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render placeholder when nothing is selected', () => {
    const wrapper = mount(Select, {
      props: {
        placeholder: 'Pick one',
        options,
      },
    })

    expect(wrapper.text()).toContain('Pick one')

    wrapper.unmount()
  })

  it('should render the selected label', () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 2,
        options,
      },
    })

    expect(wrapper.text()).toContain('Two')

    wrapper.unmount()
  })

  it('should merge caller classes into the root and inherit the font size', () => {
    const wrapper = mount(Select, {
      props: { options },
      attrs: { class: 'w-1/2 text-lg' },
    })

    const root = wrapper.find('.pxd-select')

    expect(root.element.tagName).toBe('DIV')
    expect(root.classes()).toContain('w-1/2')
    expect(root.classes()).toContain('text-lg')
    expect(root.classes()).not.toContain('w-full')
    expect(root.classes()).not.toContain('text-sm')
    // The trigger takes its font size from the root, so a caller's text size still lands.
    expect(wrapper.find('button').classes()).toContain('[font-size:inherit]!')

    wrapper.unmount()
  })

  it('should put caller attributes and listeners on the trigger button', async () => {
    let clickTarget: EventTarget | null = null
    const onClick = vi.fn((event: Event) => {
      clickTarget = event.currentTarget
    })

    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options },
      attrs: { id: 'region', 'aria-label': 'Region', onClick },
    })

    const button = trigger()

    expect(button.tagName).toBe('BUTTON')
    expect(button.id).toBe('region')
    expect(button.getAttribute('aria-label')).toBe('Region')
    expect(button.getAttribute('aria-haspopup')).toBe('listbox')
    expect(wrapper.find('.pxd-select').element.tagName).toBe('DIV')

    button.click()
    await flushPopover()

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(clickTarget).toBe(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(document.body.querySelector('div.pxd-popover')).toBeNull()

    wrapper.unmount()
  })

  it('should let a caller listen to focus on the trigger button', () => {
    const onFocus = vi.fn()

    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options },
      attrs: { onFocus },
    })

    trigger().dispatchEvent(new FocusEvent('focus'))

    expect(onFocus).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('should open from the keyboard on the trigger', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options },
    })

    const visible = () =>
      document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible')

    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await flushPopover()

    expect(visible()).toBe('true')

    wrapper.unmount()
  })

  it('should navigate the list from the trigger while open', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options },
    })

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    const items = document.body.querySelectorAll<HTMLElement>('[data-list-item]')

    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()

    expect(items[0]?.getAttribute('data-active')).toBe('true')

    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()

    expect(items[1]?.getAttribute('data-active')).toBe('true')

    wrapper.unmount()
  })

  it('should emit a scalar value when selecting a single option', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        options,
      },
    })

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    document.body.querySelectorAll<HTMLElement>('[data-list-item]')[1]?.click()
    await nextTick()

    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toBe(2)
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(2)

    wrapper.unmount()
  })

  it('should keep the panel height stable while filtering', () => {
    const wrapper = mount(Select, {
      props: {
        options,
        filterable: true,
      },
    })

    expect(wrapper.findComponent(Popover).props('keepHeight')).toBe(true)

    wrapper.unmount()
  })

  it('should keep the panel height natural when the list never filters', () => {
    const wrapper = mount(Select, {
      props: {
        options,
      },
    })

    expect(wrapper.findComponent(Popover).props('keepHeight')).toBe(false)

    wrapper.unmount()
  })

  it('should emit change once when a multiple popover closes', async () => {
    const Host = defineComponent({
      components: { Select },
      setup() {
        const value = ref<number[]>([])
        const changed = ref<number[]>()
        return {
          value,
          changed,
          options,
          onChange: (next: number[]) => {
            changed.value = next
          },
        }
      },
      template: `<Select v-model="value" :options="options" multiple @change="onChange" />`,
    })
    const wrapper = mount(Host, {
      attachTo: document.body,
    })

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    const items = document.body.querySelectorAll<HTMLElement>('[data-list-item]')
    items[0]?.click()
    await nextTick()

    expect(wrapper.vm.value).toEqual([1])
    expect(wrapper.text()).toContain('One')
    expect(items[0]?.getAttribute('data-checked')).toBe('true')
    expect(wrapper.vm.changed).toBeUndefined()

    items[2]?.click()
    await nextTick()

    expect(wrapper.vm.value).toEqual([1, 3])
    expect(wrapper.text()).toContain('One, Three')
    expect(wrapper.vm.changed).toBeUndefined()

    items[0]?.click()
    await nextTick()

    expect(wrapper.vm.value).toEqual([3])
    expect(wrapper.vm.changed).toBeUndefined()

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    expect(wrapper.vm.changed).toEqual([3])

    wrapper.unmount()
  })

  it('should filter options through the search input when filterable', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        options,
        filterable: true,
      },
    })

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    const searchInput = document.body.querySelector<HTMLInputElement>(
      '.pxd-select--search',
    ) as HTMLInputElement
    expect(searchInput).not.toBeNull()
    expect(document.activeElement).toBe(searchInput)

    searchInput.value = 'thr'
    searchInput.dispatchEvent(new Event('input'))
    await nextTick()

    const items = document.body.querySelectorAll<HTMLElement>('[data-list-item]')
    expect(items).toHaveLength(1)
    expect(items[0]?.textContent).toContain('Three')

    wrapper.unmount()
  })

  it('should keep the trigger label when the selected option is filtered out', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        modelValue: 3,
        options,
        filterable: true,
      },
    })

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    const searchInput = document.body.querySelector<HTMLInputElement>(
      '.pxd-select--search',
    ) as HTMLInputElement

    searchInput.value = 'one'
    searchInput.dispatchEvent(new Event('input'))
    await nextTick()

    expect(wrapper.text()).toContain('Three')

    wrapper.unmount()
  })

  it('should let a filter predicate decide with the whole option', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        options,
        filterable: true,
        filterMethod: (option: ListOption) => option.label === 'One',
      },
    })

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    const searchInput = document.body.querySelector<HTMLInputElement>(
      '.pxd-select--search',
    ) as HTMLInputElement
    searchInput.value = 'zzz'
    searchInput.dispatchEvent(new Event('input'))
    await nextTick()

    const items = document.body.querySelectorAll<HTMLElement>('[data-list-item]')
    expect(items).toHaveLength(1)
    expect(items[0]?.textContent).toContain('One')

    wrapper.unmount()
  })

  it('should render the options a remote filter settles on', async () => {
    const remoteFilter = vi.fn(async (query: string) => [{ label: `Result ${query}`, value: 'r' }])

    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        options,
        filterable: true,
        remoteFilter,
      },
    })

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    const searchInput = document.body.querySelector<HTMLInputElement>(
      '.pxd-select--search',
    ) as HTMLInputElement
    searchInput.value = 'thr'
    searchInput.dispatchEvent(new Event('input'))

    await vi.waitFor(() => expect(remoteFilter).toHaveBeenCalledWith('thr'))
    await vi.waitFor(() =>
      expect(document.body.querySelectorAll('[data-list-item]')).toHaveLength(1),
    )
    expect(document.body.querySelector('[data-list-item]')?.textContent).toContain('Result thr')

    wrapper.unmount()
  })

  it('should show a clear control only when clearable and a value is selected', async () => {
    const wrapper = mount(Select, {
      props: { clearable: true, options },
    })

    expect(wrapper.find('.pxd-select--clear').exists()).toBe(false)

    await wrapper.setProps({ modelValue: 2 })
    expect(wrapper.find('.pxd-select--clear').exists()).toBe(true)
    expect(wrapper.find('.pxd-select--clear svg').exists()).toBe(true)
    // A real control, so Tab reaches it and Space/Enter clear the value.
    expect(wrapper.find('.pxd-select--clear').element.tagName).toBe('BUTTON')
    expect(wrapper.find('.pxd-select--clear').attributes('aria-label')).toBe('Clear selection')

    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('.pxd-select--clear').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should clear a single value without opening the popover, reporting a cleared change', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { clearable: true, options, modelValue: 1 },
    })

    await wrapper.find('.pxd-select--clear').trigger('click')

    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toBeNull()
    expect(wrapper.emitted('change')?.[0]?.[0]).toBeNull()
    expect(wrapper.emitted('change')?.[0]?.[1]).toMatchObject({ reason: 'cleared' })
    expect(document.body.querySelector('.pxd-popover--wrapper')).toBeNull()

    wrapper.unmount()
  })

  it('should return focus to the trigger after clearing', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { clearable: true, options, modelValue: 1 },
    })

    const clearButton = wrapper.find('.pxd-select--clear').element as HTMLButtonElement

    clearButton.focus()
    await wrapper.find('.pxd-select--clear').trigger('click')

    expect(document.activeElement).toBe(trigger())

    wrapper.unmount()
  })

  it('should close on Escape', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options },
    })

    const visible = () =>
      document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible')

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    expect(visible()).toBe('true')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPopover()

    expect(visible()).toBe('false')

    wrapper.unmount()
  })

  it('should move focus out of the panel before the closed panel is hidden', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options },
    })

    trigger().focus()

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    const panel = document.body.querySelector<HTMLElement>('.pxd-popover--wrapper')!
    const hiddenWhileFocused: boolean[] = []

    document.body.querySelector<HTMLElement>('[data-list-item]')?.focus()

    panel.addEventListener('focusout', () => {
      hiddenWhileFocused.push(panel.getAttribute('aria-hidden') === 'true')
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPopover()

    expect(hiddenWhileFocused).toEqual([false])
    expect(document.activeElement).toBe(trigger())

    wrapper.unmount()
  })

  it('should let a caller turn Escape off through the popover passthrough', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options },
      attrs: { closeOnPressEscape: false },
    })

    const visible = () =>
      document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible')

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    expect(visible()).toBe('true')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPopover()

    expect(visible()).toBe('true')

    wrapper.unmount()
  })

  it('should clear a multiple value to an empty array', async () => {
    const wrapper = mount(Select, {
      props: { clearable: true, multiple: true, options, modelValue: [1, 2] },
    })

    await wrapper.find('.pxd-select--clear').trigger('click')

    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toEqual([])
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual([])
    expect(wrapper.emitted('change')?.[0]?.[1]).toMatchObject({ reason: 'cleared' })

    wrapper.unmount()
  })

  it('should keep the clear control focusable', () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { clearable: true, options, modelValue: 1 },
    })

    const clear = document.body.querySelector<HTMLButtonElement>('.pxd-select--clear')!

    clear.focus()

    expect(document.activeElement).toBe(clear)

    wrapper.unmount()
  })

  it('should show a retryable error when a remote filter rejects', async () => {
    const remoteFilter = vi.fn().mockRejectedValueOnce(new Error('offline'))
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options, filterable: true, remoteFilter },
    })

    await wrapper.find('[data-select]').trigger('click')
    await flushPopover()

    const searchInput = document.body.querySelector<HTMLInputElement>(
      '.pxd-select--search',
    ) as HTMLInputElement

    vi.useFakeTimers()
    searchInput.value = 'thr'
    searchInput.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(200)

    const alert = document.body.querySelector('[role="alert"]') as HTMLElement
    expect(alert?.textContent).toContain('Request failed. Click to reload')

    alert.click()
    await vi.advanceTimersByTimeAsync(200)

    expect(wrapper.emitted('retry')).toHaveLength(1)
    expect(remoteFilter).toHaveBeenCalledTimes(2)
    expect(document.body.querySelector('[role="alert"]')).toBeNull()

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should mark the trigger invalid', () => {
    const wrapper = mount(Select, {
      props: {
        invalid: true,
        options: [{ label: 'One', value: 1 }],
      },
    })

    expect(wrapper.find('.pxd-select').classes()).toContain('is-error')
    expect(wrapper.find('.pxd-select .pxd-button').attributes('aria-invalid')).toBe('true')

    wrapper.unmount()
  })
})
