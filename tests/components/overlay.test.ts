import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, nextTick, ref } from 'vue'
import Overlay from '../../src/components/overlay/index.vue'

async function flush() {
  await nextTick()
}

describe('overlay', () => {
  it('should render no backdrop when variant is none', async () => {
    const wrapper = mount(Overlay, {
      attachTo: document.body,
      props: { modelValue: true, variant: 'none' },
      slots: { default: '<div class="slotted">content</div>' },
    })

    await flush()

    expect(document.body.querySelector('.pxd-overlay')).toBeNull()
    expect(document.body.querySelector('.slotted')).not.toBeNull()

    wrapper.unmount()
  })

  it('should close only top overlay on Escape', async () => {
    const Demo = defineComponent({
      components: { Overlay },
      setup() {
        const outer = ref(true)
        const inner = ref(true)
        return { outer, inner }
      },
      template: `
        <Overlay v-model="outer">
          <Overlay v-model="inner" />
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

  it('should reach the underlying overlay when the top one disables escape', async () => {
    const Demo = defineComponent({
      components: { Overlay },
      setup() {
        const outer = ref(true)
        const inner = ref(true)
        return { outer, inner }
      },
      template: `
        <Overlay v-model="outer">
          <Overlay v-model="inner" :close-on-press-escape="false" />
        </Overlay>
      `,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flush()

    expect((wrapper.vm as any).inner).toBe(true)
    expect((wrapper.vm as any).outer).toBe(false)

    wrapper.unmount()
  })

  it('should close the overlay with the highest z-index', async () => {
    const Demo = defineComponent({
      components: { Overlay },
      setup() {
        return { high: ref(true), low: ref(true) }
      },
      template: `
        <Overlay v-model="high" :z-index="20" />
        <Overlay v-model="low" :z-index="5" />
      `,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flush()

    expect((wrapper.vm as any).high).toBe(false)
    expect((wrapper.vm as any).low).toBe(true)

    wrapper.unmount()
  })

  it('should allow the escape handler to cancel closing', async () => {
    const Demo = defineComponent({
      components: { Overlay },
      setup() {
        function onEscape(ev: KeyboardEvent) {
          ev.preventDefault()
        }

        return { visible: ref(true), onEscape }
      },
      template: '<Overlay v-model="visible" @escape="onEscape" />',
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }))
    await flush()

    expect((wrapper.vm as any).visible).toBe(true)

    wrapper.unmount()
  })
})
