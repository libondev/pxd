import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, getCurrentInstance, h, onMounted } from 'vue'
import Teleport from '../../src/components/teleport/index.vue'

describe('teleport', () => {
  it('renders properly', () => {
    const wrapper = mount(Teleport)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default to body', () => {
    const wrapper = mount(Teleport)

    expect(wrapper.props('to')).toBe('body')

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Teleport, {
      slots: {
        default: '<div>Teleported content</div>',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should teleport before the slot content mounts', () => {
    let parentAtMount: string | undefined

    const Content = defineComponent({
      setup() {
        const instance = getCurrentInstance()

        onMounted(() => {
          parentAtMount = (instance?.vnode.el as HTMLElement | null)?.parentElement?.tagName
        })

        return () => h('div', { class: 'content' }, 'x')
      },
    })

    const wrapper = mount(Teleport, {
      attachTo: document.body,
      slots: { default: () => h(Content) },
    })

    expect(parentAtMount).toBe('BODY')

    wrapper.unmount()
  })
})
