import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ColorScheme from '../../src/components/color-scheme/index.vue'

describe('color-scheme', () => {
  it('should emit toggle event when button is clicked', async () => {
    const wrapper = mount(ColorScheme)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted().toggle).toBeTruthy()
    expect(wrapper.emitted().toggle[0]).toEqual(['dark'])

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted().toggle[1]).toEqual(['light'])

    wrapper.unmount()
  })
})
