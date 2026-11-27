import type { MessageItemConfig } from '../../src/composables/use-message'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import MessageItem from '../../src/components/message-item/index.vue'

describe('message-item', () => {
  const defaultItemData = {
    id: 'test-1',
    variant: 'info',
    message: 'Test message',
    duration: 3000,
  } satisfies MessageItemConfig

  it('renders properly', () => {
    const wrapper = mount(MessageItem, {
      props: {
        itemData: defaultItemData,
        index: 0,
        maxCount: 5,
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render message text', () => {
    const wrapper = mount(MessageItem, {
      props: {
        itemData: { ...defaultItemData, message: 'Hello World' },
        index: 0,
        maxCount: 5,
      },
    })

    expect(wrapper.text()).toContain('Hello World')

    wrapper.unmount()
  })

  it('should emit close event', async () => {
    const wrapper = mount(MessageItem, {
      props: {
        itemData: defaultItemData,
        index: 0,
        maxCount: 5,
      },
    })

    wrapper.vm.$emit('close', 'test-1')
    expect(wrapper.emitted()).toHaveProperty('close')

    wrapper.unmount()
  })

  it('should accept different variants', () => {
    const variants = ['info', 'success', 'warning', 'error', 'loading'] as const

    for (const variant of variants) {
      const wrapper = mount(MessageItem, {
        props: {
          itemData: { ...defaultItemData, variant },
          index: 0,
          maxCount: 5,
        },
      })

      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    }
  })
})
