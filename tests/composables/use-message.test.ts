import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useMessage } from '../../src/composables/use-message'

describe('useMessage', () => {
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

  it('should dispatch create event for info message', () => {
    useMessage.info('Hello')

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.type).toBe('create')
    expect(dispatchedEvents[0].detail.data.type).toBe('info')
  })

  it('should dispatch create event for success message', () => {
    useMessage.success('Done!')

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.data.type).toBe('success')
  })

  it('should dispatch create event for warning message', () => {
    useMessage.warning('Warning!')

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.data.type).toBe('warning')
  })

  it('should dispatch create event for error message', () => {
    useMessage.error('Error!')

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.data.type).toBe('error')
  })

  it('should dispatch create event for loading message', () => {
    useMessage.loading('Loading...')

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.data.type).toBe('loading')
  })

  it('should dispatch create event when called directly', () => {
    useMessage('Hello')

    expect(dispatchedEvents).toHaveLength(1)
    expect(dispatchedEvents[0].detail.type).toBe('create')
  })
})
