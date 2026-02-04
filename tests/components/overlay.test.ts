import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import Overlay from '../../src/components/overlay/index.vue'

async function flush() {
  await nextTick()
}

describe('overlay', () => {
  it('should close only top overlay on Escape', async () => {
    const Demo = defineComponent({
      components: { Overlay },
      setup() {
        const outer = ref(true)
        const inner = ref(true)
        return { outer, inner }
      },
      template: `
        <Overlay v-model="outer" :append-to-body="false">
          <Overlay v-model="inner" :append-to-body="false" />
        </Overlay>
      `,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flush()

    expect((wrapper.vm as any).inner).toBe(false)
    expect((wrapper.vm as any).outer).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flush()

    expect((wrapper.vm as any).outer).toBe(false)

    wrapper.unmount()
  })

  it('should not close underlying overlay if top disables escape', async () => {
    const Demo = defineComponent({
      components: { Overlay },
      setup() {
        const outer = ref(true)
        const inner = ref(true)
        return { outer, inner }
      },
      template: `
        <Overlay v-model="outer" :append-to-body="false">
          <Overlay v-model="inner" :append-to-body="false" :close-on-press-escape="false" />
        </Overlay>
      `,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flush()

    expect((wrapper.vm as any).inner).toBe(true)
    expect((wrapper.vm as any).outer).toBe(true)

    wrapper.unmount()
  })
})
