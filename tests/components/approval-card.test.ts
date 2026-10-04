import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import ApprovalCard from '../../src/components/approval-card/index.vue'

function findButton(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.findAll('button').find((button) => button.text() === label)
}

describe('approval-card', () => {
  it('should render title and command', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        command: 'pnpm db:migrate && pnpm build',
      },
    })

    expect(wrapper.text()).toContain('Run this command?')
    expect(wrapper.text()).toContain('pnpm db:migrate && pnpm build')

    wrapper.unmount()
  })

  it('should not render the command block for an empty command', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        command: '',
      },
    })

    expect(wrapper.find('.pxd-approval-card--command').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should restart the timeout when the `timeout` prop changes', async () => {
    vi.useFakeTimers()

    const wrapper = mount(ApprovalCard, {
      props: {
        timeout: 1000,
      },
    })

    vi.advanceTimersByTime(900)
    await wrapper.setProps({ timeout: 5000 })

    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().decide).toBeUndefined()

    vi.advanceTimersByTime(5000)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().decide).toEqual([[{ status: 'dismissed', cause: 'timeout' }]])

    wrapper.unmount()

    vi.useRealTimers()
  })

  it('should fall through attrs to the root element', () => {
    const wrapper = mount(ApprovalCard, {
      attrs: {
        class: 'custom-card',
        'data-testid': 'approval',
      },
    })

    expect(wrapper.classes()).toContain('custom-card')
    expect(wrapper.attributes('data-testid')).toBe('approval')

    wrapper.unmount()
  })

  it('should render an array command line by line', () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        command: ['pnpm db:migrate', 'pnpm build'],
      },
    })

    expect(wrapper.findAll('.pxd-snippet--container pre')).toHaveLength(2)
    expect(wrapper.text()).toContain('pnpm db:migrate')
    expect(wrapper.text()).toContain('pnpm build')

    wrapper.unmount()
  })

  it('should trigger `decide` and `approve` event', async () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        command: 'rm -rf dist',
      },
    })

    await findButton(wrapper, 'Run')!.trigger('click')

    expect(wrapper.emitted().decide).toEqual([[{ status: 'approved', remember: false }]])
    expect(wrapper.emitted().approve).toEqual([[{ status: 'approved', remember: false }]])
    expect(wrapper.emitted()['update:modelValue']).toEqual([['approved']])
    expect(wrapper.find('.pxd-approval-card--actions').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should trigger `decide` and `reject` event', async () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        command: 'rm -rf dist',
      },
    })

    await findButton(wrapper, 'Skip')!.trigger('click')

    expect(wrapper.emitted().decide).toEqual([[{ status: 'rejected', reason: undefined }]])
    expect(wrapper.emitted().reject).toEqual([[{ status: 'rejected', reason: undefined }]])
    expect(wrapper.emitted().approve).toBeUndefined()

    wrapper.unmount()
  })

  it('should not decide twice', async () => {
    const wrapper = mount(ApprovalCard)

    await findButton(wrapper, 'Run')!.trigger('click')
    await wrapper.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted().decide).toHaveLength(1)

    wrapper.unmount()
  })

  it('should dismiss on Escape', async () => {
    const wrapper = mount(ApprovalCard)

    await wrapper.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted().decide).toEqual([[{ status: 'dismissed', cause: 'escape' }]])

    wrapper.unmount()
  })

  it('should not dismiss on Escape when `closeOnPressEscape` is false', async () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        closeOnPressEscape: false,
      },
    })

    await wrapper.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted().decide).toBeUndefined()

    wrapper.unmount()
  })

  it('should dismiss on timeout', async () => {
    vi.useFakeTimers()

    const wrapper = mount(ApprovalCard, {
      props: {
        timeout: 1000,
      },
    })

    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().decide).toEqual([[{ status: 'dismissed', cause: 'timeout' }]])

    wrapper.unmount()

    vi.useRealTimers()
  })

  it('should carry the remember flag into the approve result', async () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        rememberable: true,
      },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    await findButton(wrapper, 'Run')!.trigger('click')

    expect(wrapper.emitted().approve).toEqual([[{ status: 'approved', remember: true }]])

    wrapper.unmount()
  })

  it('should follow `modelValue` instead of the internal status', async () => {
    const wrapper = mount(ApprovalCard, {
      props: {
        modelValue: 'approved',
      },
    })

    expect(wrapper.attributes('data-status')).toBe('approved')
    expect(wrapper.find('.pxd-approval-card--actions').exists()).toBe(false)
    expect(wrapper.emitted().decide).toBeUndefined()

    await wrapper.setProps({ modelValue: 'pending' })

    expect(wrapper.find('.pxd-approval-card--actions').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should return to pending after `reset()`', async () => {
    const wrapper = mount(ApprovalCard)

    await findButton(wrapper, 'Skip')!.trigger('click')

    expect(wrapper.attributes('data-status')).toBe('rejected')

    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('data-status')).toBe('pending')
    expect(wrapper.emitted()['update:modelValue']).toEqual([['rejected'], ['pending']])

    wrapper.unmount()
  })
})
