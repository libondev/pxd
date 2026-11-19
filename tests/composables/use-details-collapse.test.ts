import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
import { useDetailsCollapse } from '../../src/composables/use-details-collapse'
import { runWithScope } from '../helpers/setup'

function createContent(transitionDuration?: string) {
  const el = document.createElement('div')

  if (transitionDuration) {
    el.style.transitionDuration = transitionDuration
  }

  document.body.append(el)

  return el
}

function dispatchTransitionEnd(el: HTMLElement, propertyName = 'grid-template-rows') {
  const event = new Event('transitionend')

  Object.defineProperty(event, 'propertyName', { value: propertyName })
  el.dispatchEvent(event)
}

// The enter path commits `open` one tick after the row flips, so a toggle needs two flushes.
async function flushToggle() {
  await nextTick()
  await nextTick()
}

describe('useDetailsCollapse', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('should start from the initial open value', () => {
    const content = createContent()
    const { result, stop } = runWithScope(() => useDetailsCollapse(content, true))

    expect(result.isOpen.value).toBe(true)
    expect(result.detailsOpen.value).toBe(true)

    stop()
  })

  it('should mount the content first and open it on the next tick', async () => {
    const content = createContent()
    const { result, stop } = runWithScope(() => useDetailsCollapse(content, false))

    result.onToggleClick()

    expect(result.detailsOpen.value).toBe(true)
    expect(result.isOpen.value).toBe(false)

    await flushToggle()

    expect(result.isOpen.value).toBe(true)

    stop()
  })

  it('should close at once when the content has no transition', async () => {
    const content = createContent()
    const { result, stop } = runWithScope(() => useDetailsCollapse(content, true))

    result.onToggleClick()
    await flushToggle()

    expect(result.isOpen.value).toBe(false)
    expect(result.detailsOpen.value).toBe(false)

    stop()
  })

  it('should keep the content mounted until the row transition ends', async () => {
    const content = createContent('0.2s')
    const { result, stop } = runWithScope(() => useDetailsCollapse(content, true))

    result.onToggleClick()
    await flushToggle()

    expect(result.isOpen.value).toBe(false)
    expect(result.detailsOpen.value).toBe(true)

    dispatchTransitionEnd(content)

    expect(result.detailsOpen.value).toBe(false)

    stop()
  })

  it('should ignore a transition that is not the row', async () => {
    const content = createContent('0.2s')
    const { result, stop } = runWithScope(() => useDetailsCollapse(content, true))

    result.onToggleClick()
    await flushToggle()

    dispatchTransitionEnd(content, 'opacity')

    expect(result.detailsOpen.value).toBe(true)

    stop()
  })

  it('should drop the content when the transition never reports an end', async () => {
    vi.useFakeTimers()

    const content = createContent('0.2s')
    const { result, stop } = runWithScope(() => useDetailsCollapse(content, true))

    result.onToggleClick()
    await flushToggle()

    expect(result.detailsOpen.value).toBe(true)

    await vi.advanceTimersByTimeAsync(250)

    expect(result.detailsOpen.value).toBe(false)

    stop()
  })

  it('should follow the controlled value', async () => {
    const content = createContent()
    const open = ref(false)
    const { result, stop } = runWithScope(() => useDetailsCollapse(content, open))

    open.value = true
    await flushToggle()

    expect(result.isOpen.value).toBe(true)

    open.value = false
    await flushToggle()

    expect(result.isOpen.value).toBe(false)
    expect(result.detailsOpen.value).toBe(false)

    stop()
  })

  it('should expand when the native details opens', async () => {
    const content = createContent()
    const details = document.createElement('details')
    const event = new Event('toggle')

    Object.defineProperty(event, 'currentTarget', { value: details })

    const { result, stop } = runWithScope(() => useDetailsCollapse(content, false))

    details.open = true
    result.onDetailsToggle(event)
    await flushToggle()

    expect(result.isOpen.value).toBe(true)

    stop()
  })
})
