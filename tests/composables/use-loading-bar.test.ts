import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useLoadingBar } from '../../src/composables/use-loading-bar'

describe('useLoadingBar', () => {
  let dispatchedEvents: CustomEvent[]

  beforeEach(() => {
    dispatchedEvents = []
    vi.spyOn(window, 'dispatchEvent').mockImplementation((event: Event) => {
      if (event instanceof CustomEvent) {
        dispatchedEvents.push(event)
      }
      return true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should dispatch custom event on start', () => {
    useLoadingBar.start('default')

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.type).toBe('start')
    expect(dispatchedEvents[0].detail.group).toBe('default')
  })

  it('should dispatch custom event on finish', () => {
    useLoadingBar.finish('default')

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.type).toBe('finish')
  })

  it('should dispatch custom event on error', () => {
    useLoadingBar.error('default')

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.type).toBe('error')
  })

  it('should dispatch custom event on increase', () => {
    useLoadingBar.increase('default', 0.5)

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.type).toBe('increase')
    expect(dispatchedEvents[0].detail.value).toBe(0.5)
  })

  it('should support custom group', () => {
    useLoadingBar.start('custom-group')

    expect(dispatchedEvents[0].detail.group).toBe('custom-group')
  })
})
