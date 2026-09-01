import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, nextTick, ref } from 'vue'
import Select from '../../src/components/select/index.vue'

async function flushPopover() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  await Promise.resolve()
}

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]

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

  it('should emit a scalar value when selecting a single option', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        options,
      },
    })

    await wrapper.find('button').trigger('click')
    await flushPopover()

    document.body.querySelectorAll<HTMLElement>('[data-list-item]')[1]?.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(2)
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(2)

    wrapper.unmount()
  })

  it('should toggle values when multiple and emit change on close', async () => {
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

    await wrapper.find('button').trigger('click')
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

    items[0]?.click()
    await nextTick()

    expect(wrapper.vm.value).toEqual([3])
    expect(wrapper.vm.changed).toBeUndefined()

    await wrapper.find('button').trigger('click')
    await flushPopover()

    expect(wrapper.vm.changed).toEqual([3])

    wrapper.unmount()
  })
})
