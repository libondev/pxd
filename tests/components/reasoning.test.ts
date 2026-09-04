import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Reasoning from '../../src/components/reasoning/index.vue'

describe('reasoning', () => {
  it('opens when streaming', () => {
    const wrapper = mount(Reasoning, {
      props: { streaming: true },
    })

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(true)

    wrapper.unmount()
  })

  it('toggles on trigger click', async () => {
    const wrapper = mount(Reasoning, {
      slots: { default: '<p>Trace</p>' },
    })

    await wrapper.find('summary').trigger('click')
    await nextTick()

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(false)

    wrapper.unmount()
  })
})
