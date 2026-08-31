import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h, type Slots } from 'vue'
import StepsItem from '../../src/components/steps-item/index.vue'
import Steps from '../../src/components/steps/index.vue'

function createItems(count = 3) {
  return Array.from({ length: count }, (_, index) =>
    h(StepsItem, { title: `Step ${index + 1}`, description: `Description ${index + 1}` }),
  )
}

async function mountSteps(props: Record<string, unknown> = {}, slots?: Slots) {
  const wrapper = mount(Steps, {
    props: { modelValue: 0, ...props },
    slots: slots ?? { default: () => createItems() },
  })

  await wrapper.vm.$nextTick()

  return wrapper
}

describe('steps', () => {
  it('renders items with titles and descriptions', async () => {
    const wrapper = await mountSteps()

    expect(wrapper.findAll('.pxd-steps-item')).toHaveLength(3)
    expect(wrapper.text()).toContain('Step 1')
    expect(wrapper.text()).toContain('Description 1')

    wrapper.unmount()
  })

  it('derives status from modelValue', async () => {
    const wrapper = await mountSteps({ modelValue: 1 })

    const items = wrapper.findAll('.pxd-steps-item')

    expect(items[0]?.attributes('data-status')).toBe('finish')
    expect(items[1]?.attributes('data-status')).toBe('process')
    expect(items[2]?.attributes('data-status')).toBe('wait')

    wrapper.unmount()
  })

  it('uses parent status for the current step', async () => {
    const wrapper = await mountSteps({ modelValue: 1, status: 'error' })

    const items = wrapper.findAll('.pxd-steps-item')

    expect(items[1]?.attributes('data-status')).toBe('error')

    wrapper.unmount()
  })

  it('lets item status override derived status', async () => {
    const wrapper = await mountSteps(
      { modelValue: 1 },
      {
        default: () => [
          h(StepsItem, { title: 'Step 1' }),
          h(StepsItem, { title: 'Step 2', status: 'error' }),
          h(StepsItem, { title: 'Step 3' }),
        ],
      },
    )

    const items = wrapper.findAll('.pxd-steps-item')

    expect(items[1]?.attributes('data-status')).toBe('error')

    wrapper.unmount()
  })

  it('renders finish and error icons instead of index', async () => {
    const wrapper = await mountSteps({ modelValue: 1, status: 'error' })

    const indicators = wrapper.findAll('.pxd-steps-item--indicator')

    expect(indicators[0]?.find('.pxd-steps-item--icon').exists()).toBe(true)
    expect(indicators[1]?.find('.pxd-steps-item--icon').exists()).toBe(true)
    expect(indicators[2]?.find('.pxd-steps-item--icon').exists()).toBe(false)
    expect(indicators[2]?.text()).toBe('3')

    wrapper.unmount()
  })

  it('emits update:modelValue and change on item click', async () => {
    const wrapper = await mountSteps({ modelValue: 0, clickable: true })

    await wrapper.findAll('.pxd-steps-item')[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([2])

    wrapper.unmount()
  })

  it('ignores clicks when clickable is disabled', async () => {
    const wrapper = await mountSteps({ modelValue: 0 })

    await wrapper.findAll('.pxd-steps-item')[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('ignores clicks on disabled items', async () => {
    const wrapper = await mountSteps(
      { modelValue: 0, clickable: true },
      {
        default: () => [
          h(StepsItem, { title: 'Step 1' }),
          h(StepsItem, { title: 'Step 2', disabled: true }),
        ],
      },
    )

    await wrapper.findAll('.pxd-steps-item')[1]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('supports vertical layout', async () => {
    const wrapper = await mountSteps({ modelValue: 0, direction: 'vertical' })

    expect(wrapper.find('.pxd-steps').attributes('data-direction')).toBe('vertical')

    wrapper.unmount()
  })

  it('defaults direction to horizontal', async () => {
    const wrapper = await mountSteps({ modelValue: 0 })

    expect(wrapper.find('.pxd-steps').attributes('data-direction')).toBe('horizontal')

    wrapper.unmount()
  })

  it('applies size styles', async () => {
    const wrapper = await mountSteps({ modelValue: 0, size: 'lg' })

    expect(wrapper.find('.pxd-steps').attributes('style')).toContain('--steps-indicator-size')

    wrapper.unmount()
  })
})
