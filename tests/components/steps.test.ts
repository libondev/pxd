import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Steps from '../../src/components/steps/index.vue'

const OPTIONS = [
  { description: 'Review items in your cart', title: 'Cart' },
  { description: 'Choose a payment method', title: 'Payment' },
  { description: 'Order confirmed', title: 'Done' },
]

async function mountSteps(props: Record<string, unknown> = {}, slots?: Record<string, any>) {
  const wrapper = mount(Steps, {
    props: { modelValue: 0, options: OPTIONS, ...props },
    slots,
  })

  await nextTick()

  return wrapper
}

describe('steps', () => {
  it('renders every option with its title and description', async () => {
    const wrapper = await mountSteps()

    expect(wrapper.findAll('.pxd-steps-item')).toHaveLength(3)
    expect(wrapper.text()).toContain('Cart')
    expect(wrapper.text()).toContain('Review items in your cart')

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

    expect(wrapper.findAll('.pxd-steps-item')[1]?.attributes('data-status')).toBe('error')

    wrapper.unmount()
  })

  it('lets an option status override the derived status', async () => {
    const wrapper = await mountSteps({
      modelValue: 1,
      options: [{ title: 'Cart' }, { status: 'error', title: 'Payment' }, { title: 'Done' }],
    })

    expect(wrapper.findAll('.pxd-steps-item')[1]?.attributes('data-status')).toBe('error')

    wrapper.unmount()
  })

  it('renders finish and error icons instead of the index', async () => {
    const wrapper = await mountSteps({ modelValue: 1, status: 'error' })
    const indicators = wrapper.findAll('.pxd-steps-item--indicator')

    expect(indicators[0]?.find('.pxd-steps-item--icon').exists()).toBe(true)
    expect(indicators[1]?.find('.pxd-steps-item--icon').exists()).toBe(true)
    expect(indicators[2]?.find('.pxd-steps-item--icon').exists()).toBe(false)
    expect(indicators[2]?.text()).toBe('3')

    wrapper.unmount()
  })

  it('emits update:modelValue and change on step click', async () => {
    const wrapper = await mountSteps({ clickable: true, modelValue: 0 })

    await wrapper.findAll('.pxd-steps-item')[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([2])

    wrapper.unmount()
  })

  it('does not emit when the current step is clicked again', async () => {
    const wrapper = await mountSteps({ clickable: true, modelValue: 1 })

    await wrapper.findAll('.pxd-steps-item')[1]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('ignores clicks when clickable is disabled', async () => {
    const wrapper = await mountSteps({ modelValue: 0 })

    await wrapper.findAll('.pxd-steps-item')[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('ignores clicks on a disabled option', async () => {
    const wrapper = await mountSteps({
      clickable: true,
      modelValue: 0,
      options: [{ title: 'Cart' }, { disabled: true, title: 'Payment' }],
    })

    await wrapper.findAll('.pxd-steps-item')[1]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('works uncontrolled with default-value', async () => {
    const wrapper = await mountSteps({ clickable: true, defaultValue: 0, modelValue: undefined })

    await wrapper.findAll('.pxd-steps-item')[2]!.trigger('click')

    const items = wrapper.findAll('.pxd-steps-item')

    expect(items[2]?.attributes('data-status')).toBe('process')
    expect(items[0]?.attributes('data-status')).toBe('finish')

    wrapper.unmount()
  })

  it('follows the order of the options', async () => {
    const options = ref([{ title: 'Cart' }, { title: 'Payment' }, { title: 'Done' }])

    const wrapper = mount(
      defineComponent({
        setup() {
          return () => h(Steps, { modelValue: 0, options: options.value })
        },
      }),
    )

    await nextTick()
    expect(
      wrapper
        .findAll('.pxd-steps-item--title')
        .map((n) => n.text())
        .join(),
    ).toBe('Cart,Payment,Done')

    options.value = [{ title: 'Done' }, { title: 'Cart' }]
    await nextTick()

    expect(wrapper.findAll('.pxd-steps-item')).toHaveLength(2)
    expect(
      wrapper
        .findAll('.pxd-steps-item--title')
        .map((n) => n.text())
        .join(),
    ).toBe('Done,Cart')

    wrapper.unmount()
  })

  it('renders the whole step bar on the server', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(Steps, { modelValue: 1, options: OPTIONS }) }),
    )

    expect(html.match(/role="listitem"/g)).toHaveLength(3)
    expect(html).toContain('Cart')
  })

  it('renders multi-root item content', async () => {
    const wrapper = await mountSteps(
      { modelValue: 1 },
      {
        item: ({ index }: any) => [h('b', `top-${index}`), h('i', `bottom-${index}`)],
      },
    )

    expect(
      wrapper
        .findAll('.pxd-steps-item b')
        .map((n) => n.text())
        .join(),
    ).toBe('top-0,top-1,top-2')
    expect(
      wrapper
        .findAll('.pxd-steps-item i')
        .map((n) => n.text())
        .join(),
    ).toBe('bottom-0,bottom-1,bottom-2')

    wrapper.unmount()
  })

  it('keeps slot content clickable', async () => {
    const wrapper = await mountSteps(
      { clickable: true, modelValue: 0 },
      { item: ({ index }: any) => h('span', { class: 'custom-step' }, `step-${index}`) },
    )

    await wrapper.findAll('.custom-step')[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([2])

    wrapper.unmount()
  })

  it('marks a disabled option through the item slot', async () => {
    const wrapper = await mountSteps(
      {
        clickable: true,
        modelValue: 0,
        options: [{ title: 'Cart' }, { disabled: true, title: 'Payment' }],
      },
      { item: ({ item }: any) => h('span', item.title) },
    )

    const items = wrapper.findAll('.pxd-steps-item')

    expect(items[0]?.attributes('data-disabled')).toBe('false')
    expect(items[1]?.attributes('data-disabled')).toBe('true')

    wrapper.unmount()
  })

  it('lets the item slot replace the step content', async () => {
    const wrapper = await mountSteps(
      { modelValue: 1 },
      {
        item: ({ index, item, status }: any) =>
          h('div', { class: 'custom-step' }, [index, ':', item.title, ':', status]),
      },
    )

    expect(
      wrapper
        .findAll('.custom-step')
        .map((n) => n.text())
        .join(),
    ).toBe('0:Cart:finish,1:Payment:process,2:Done:wait')
    expect(wrapper.text()).not.toContain('Review items in your cart')

    wrapper.unmount()
  })

  it('supports vertical layout', async () => {
    const wrapper = await mountSteps({ direction: 'vertical', modelValue: 0 })

    expect(wrapper.find('.pxd-steps').attributes('data-direction')).toBe('vertical')

    wrapper.unmount()
  })

  it('defaults direction to horizontal', async () => {
    const wrapper = await mountSteps()

    expect(wrapper.find('.pxd-steps').attributes('data-direction')).toBe('horizontal')

    wrapper.unmount()
  })

  it('applies size styles', async () => {
    const wrapper = await mountSteps({ modelValue: 0, size: 'lg' })

    expect(wrapper.find('.pxd-steps').attributes('style')).toContain('--steps-indicator-size')

    wrapper.unmount()
  })
})
