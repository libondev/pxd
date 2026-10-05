import type { TreeDropPosition, TreeDropTarget, TreeFlatNode } from '../../components/tree/types'
import type { MaybeElementRef } from '../../types/shared'
import type { ComponentValue } from '../../types/shared'
import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose, shallowRef, toValue } from 'vue'
import { getElement } from '../../utils/dom.js'

/** Movement before the pointer is treated as a drag, so a plain click never arms it. */
const DRAG_THRESHOLD = 5

/** Distance from the container edge where the tree starts scrolling itself. */
const EDGE_SIZE = 32

/** Auto-scroll speed in px per frame. */
const EDGE_SPEED = 12

/** How long a collapsed parent must be hovered before it opens. */
const EXPAND_DELAY = 500

export interface UseTreeDragOptions {
  container: MaybeElementRef<HTMLElement>
  /** Rendered rows, the only ones the pointer can be measured against. */
  rows: MaybeRefOrGetter<TreeFlatNode[]>
  /** Whole-session gate: off while searching, while disabled, or without the prop. */
  enabled: MaybeRefOrGetter<boolean>
  /** Rejects a position the tree will refuse, so no indicator is ever painted for it. */
  canDrop: (
    value: ComponentValue,
    targetValue: ComponentValue,
    position: TreeDropPosition,
  ) => boolean
  onExpand: (value: ComponentValue) => void
  onCommit: (value: ComponentValue, target: TreeDropTarget) => void
}

export function useTreeDrag(options: UseTreeDragOptions) {
  const value = shallowRef<ComponentValue>()
  const target = shallowRef<TreeDropTarget>()
  const x = shallowRef(0)
  const y = shallowRef(0)

  let armed: { value: ComponentValue; x: number; y: number } | undefined
  let frame: number | undefined
  let autoScroll = 0
  let expandTimer: ReturnType<typeof setTimeout> | undefined
  let expandValue: ComponentValue | undefined

  function resolveTarget(clientY: number): TreeDropTarget | undefined {
    const container = getElement(options.container)
    if (!container) {
      return undefined
    }

    const rows = toValue(options.rows)
    const items = container.querySelectorAll<HTMLElement>('[data-tree-item]')
    let nearest: { row: TreeFlatNode; rect: DOMRect } | undefined

    for (const item of Array.from(items)) {
      const row = rows[Number(item.dataset.index)]

      if (!row) {
        continue
      }

      const rect = item.getBoundingClientRect()

      if (clientY >= rect.top && clientY <= rect.bottom) {
        return toTarget(row, rect, clientY)
      }

      if (!nearest || Math.abs(rect.top - clientY) < Math.abs(nearest.rect.top - clientY)) {
        nearest = { row, rect }
      }
    }

    return nearest ? toTarget(nearest.row, nearest.rect, clientY) : undefined
  }

  function toTarget(row: TreeFlatNode, rect: DOMRect, clientY: number): TreeDropTarget | undefined {
    const dragged = value.value

    if (dragged === undefined) {
      return undefined
    }

    const ratio = (clientY - rect.top) / (rect.height || 1)
    const position: TreeDropPosition =
      row.hasChildren && ratio > 0.25 && ratio < 0.75 ? 'inside' : ratio < 0.5 ? 'before' : 'after'

    return options.canDrop(dragged, row.key, position)
      ? { targetValue: row.key, position }
      : undefined
  }

  function scheduleExpand(next: TreeDropTarget | undefined): void {
    if (!next || next.position !== 'inside') {
      clearExpand()
      return
    }

    if (expandValue === next.targetValue) {
      return
    }

    clearExpand()
    expandValue = next.targetValue

    expandTimer = setTimeout(() => {
      expandTimer = undefined

      if (expandValue !== undefined) {
        options.onExpand(expandValue)
      }
    }, EXPAND_DELAY)
  }

  function clearExpand(): void {
    if (expandTimer !== undefined) {
      clearTimeout(expandTimer)
      expandTimer = undefined
    }

    expandValue = undefined
  }

  function tick(): void {
    frame = undefined

    const container = getElement(options.container)

    if (container && autoScroll !== 0) {
      container.scrollTop += autoScroll
      target.value = resolveTarget(y.value)
    }

    if (autoScroll !== 0) {
      frame = requestAnimationFrame(tick)
    }
  }

  function updateAutoScroll(clientY: number): void {
    const container = getElement(options.container)
    if (!container) {
      return
    }

    const rect = container.getBoundingClientRect()

    if (clientY - rect.top < EDGE_SIZE) {
      autoScroll = -EDGE_SPEED
    } else if (rect.bottom - clientY < EDGE_SIZE) {
      autoScroll = EDGE_SPEED
    } else {
      autoScroll = 0
    }

    if (autoScroll !== 0 && frame === undefined) {
      frame = requestAnimationFrame(tick)
    }
  }

  function stopAutoScroll(): void {
    autoScroll = 0

    if (frame !== undefined) {
      cancelAnimationFrame(frame)
      frame = undefined
    }
  }

  function detach(): void {
    window.removeEventListener('pointermove', onPointerMove as EventListener)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerCancel)
    window.removeEventListener('keydown', onKeydown)
    armed = undefined
    stopAutoScroll()
    clearExpand()
  }

  function reset(): void {
    value.value = undefined
    target.value = undefined
    detach()
  }

  function onPointerMove(event: PointerEvent): void {
    if (armed) {
      const moved =
        Math.abs(event.clientY - armed.y) >= DRAG_THRESHOLD ||
        Math.abs(event.clientX - armed.x) >= DRAG_THRESHOLD

      if (!moved) {
        return
      }

      window.removeEventListener('keydown', onKeydown)
      window.addEventListener('keydown', onKeydown)
      value.value = armed.value
      armed = undefined
    }

    if (value.value === undefined) {
      return
    }

    x.value = event.clientX
    y.value = event.clientY
    target.value = resolveTarget(event.clientY)
    scheduleExpand(target.value)
    updateAutoScroll(event.clientY)
  }

  function onPointerUp(): void {
    const dragged = value.value
    const dropped = target.value

    reset()

    if (dragged !== undefined && dropped) {
      options.onCommit(dragged, dropped)
    }
  }

  function onPointerCancel(): void {
    reset()
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      reset()
    }
  }

  function onPointerDown(nodeValue: ComponentValue, event: PointerEvent): void {
    if (armed || toValue(options.enabled) === false || event.button !== 0) {
      return
    }

    armed = { value: nodeValue, x: event.clientX, y: event.clientY }
    window.addEventListener('pointermove', onPointerMove as EventListener)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
  }

  onScopeDispose(reset)

  return { value, target, x, y, onPointerDown, cancel: reset }
}
