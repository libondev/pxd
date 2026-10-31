import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Reasoning from '../../src/components/reasoning/index.vue'

describe('reasoning', () => {
  it('is expanded by default', () => {
    const wrapper = mount(Reasoning)

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(true)

    wrapper.unmount()
  })

  it('starts collapsed when expand is false', () => {
    const wrapper = mount(Reasoning, {
      props: { expand: false },
    })

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(false)

    wrapper.unmount()
  })

  it('renders an empty title when none is provided', () => {
    const wrapper = mount(Reasoning)

    expect(wrapper.find('.pxd-reasoning--title').text()).toBe('')

    wrapper.unmount()
  })

  it('renders the title prop instead of the locale text', () => {
    const wrapper = mount(Reasoning, {
      props: { title: 'Planning' },
    })

    expect(wrapper.find('.pxd-reasoning--title').text()).toBe('Planning')

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
