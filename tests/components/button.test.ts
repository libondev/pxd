import { mount } from '@vue/test-utils'

import { describe, expect, it } from 'vitest'
import Button from '../../src/components/button/index.vue'

describe('button', () => {
  it('renders properly', () => {
    const button = mount(Button, {
      slots: {
        default: 'Hello PXD!',
      },
    })

    expect(button.text()).toContain('Hello PXD!')
  })

  describe('variant should equal outline', () => {
    it('should render an outline button', () => {
      const button = mount(Button, {
        props: {
          variant: 'outline',
        },
      })

      expect(button.html()).toMatchInlineSnapshot(`"<button class="pxd-button cursor-pointer transition-colors items-center justify-center bg-background text-foreground hover:bg-background-hover active:bg-background-active border border-input px-2.5 rounded-md h-8 text-sm inline-flex"><span class="px-1 inline-flex truncate"></span></button>"`)
    })
  })

  it('should emit a click event when clicked', async () => {
    const wrapper = mount(Button)

    wrapper.find('button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
