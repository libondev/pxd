import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
import { useOverlayDialog } from '../../src/composables/_internal/use-overlay-dialog'
import { useSetupWrapper } from '../helpers/setup'

const mocks = vi.hoisted(() => ({
  createFocusTrap: vi.fn(() => ({ activate: vi.fn(), deactivate: vi.fn() })),
}))

vi.mock('focus-trap', () => ({ createFocusTrap: mocks.createFocusTrap }))

describe('useOverlayDialog', () => {
  afterEach(() => {
    mocks.createFocusTrap.mockClear()
  })

  it('should keep the focus trap active on escape and outside click', async () => {
    const elementRef = ref<HTMLElement>()
    const { unmount } = useSetupWrapper(() =>
      useOverlayDialog({
        props: { closeOnPressEscape: true, closeOnClickOverlay: true },
        emits: () => {},
        elementRef,
        onClose: () => {},
      }),
    )

    elementRef.value = document.createElement('div')
    await nextTick()

    expect(mocks.createFocusTrap).toHaveBeenCalledWith(
      elementRef.value,
      expect.objectContaining({ escapeDeactivates: false, clickOutsideDeactivates: false }),
    )

    unmount()
  })

  it('should not close while loading', () => {
    const onClose = vi.fn()
    const { closeOverlayIfNeed, unmount } = useSetupWrapper(() =>
      useOverlayDialog({
        props: { loading: true },
        emits: () => {},
        elementRef: ref(),
        onClose,
      }),
    )

    closeOverlayIfNeed()

    expect(onClose).not.toHaveBeenCalled()

    unmount()
  })
})
