import type { ComponentPublicInstance } from 'vue'
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'

export interface VirtualListProps {
  dataKey?: string
  listData: any[]
  itemSize: number
}

interface Position {
  index: number
  height: number
  top: number
  bottom: number
}

const DEFAULT_ITEM_SIZE = 50
const BUFFER_SIZE = 2

export function useVirtualList<Props extends VirtualListProps>(props: Props) {
  const containerRef = shallowRef<HTMLElement>()
  const itemRefs = new Map<number | string, HTMLElement>()

  const start = ref(0)
  const offset = ref(0)
  const containerHeight = ref(0)
  const positions = ref<Position[]>([])

  const safeListData = computed(() => props.listData || [])
  const safeItemSize = computed(() => props.itemSize || DEFAULT_ITEM_SIZE)

  const renderCount = computed(() => {
    if (containerHeight.value === 0 || safeItemSize.value === 0) {
      return 0
    }
    return Math.ceil(containerHeight.value / safeItemSize.value) + BUFFER_SIZE
  })

  const end = computed(() => Math.min(start.value + renderCount.value, safeListData.value.length))

  const renderList = computed(() => safeListData.value.slice(start.value, end.value))

  const listHeight = computed(() => {
    if (positions.value.length === 0) {
      return 0
    }
    return positions.value[positions.value.length - 1]?.bottom || 0
  })

  // const listStyle = computed(() => ({
  //   transform: `translate3d(0, ${offset.value}px, 0)`,
  // }))
  const listStyle = computed(() => `transform: translate3d(0, ${offset.value}px, 0)`)

  const setItemRef = (el: Element | ComponentPublicInstance | null, key: number | string) => {
    if (el) {
      itemRefs.set(key, el instanceof HTMLElement ? el : (el as ComponentPublicInstance).$el)
    } else {
      itemRefs.delete(key)
    }
  }

  const clearItemRefs = () => {
    itemRefs.clear()
  }

  const getStartIndex = (scrollTop: number): number => {
    if (positions.value.length === 0) {
      return 0
    }

    let low = 0
    let high = positions.value.length - 1
    let result = 0

    while (low <= high) {
      const mid = low + Math.floor((high - low) / 2)
      const position = positions.value[mid]

      if (!position) {
        break
      }

      if (position.bottom <= scrollTop) {
        low = mid + 1
        result = low
      } else {
        high = mid - 1
      }
    }

    return Math.min(result, positions.value.length - 1)
  }

  const handleScroll = (ev: Event) => {
    const target = ev.target as HTMLElement
    if (!target) {
      return
    }

    const newStart = getStartIndex(target.scrollTop)
    start.value = newStart
    offset.value = newStart > 0 && positions.value[newStart] ? positions.value[newStart].top : 0
  }

  const initPositions = () => {
    if (!safeListData.value.length) {
      positions.value = []
      return
    }

    positions.value = safeListData.value.map((_, index) => ({
      index,
      height: safeItemSize.value,
      top: index * safeItemSize.value,
      bottom: (index + 1) * safeItemSize.value,
    }))
  }

  const updatePositions = () => {
    if (!renderList.value.length || positions.value.length === 0) {
      return
    }

    let firstChangedIndex = -1
    const changes: { index: number, newHeight: number }[] = []

    renderList.value.forEach((_, i) => {
      const index = start.value + i
      const itemData = props.listData[index]
      const itemEl = itemRefs.get(itemData[props.dataKey!])
      const position = positions.value[index]

      if (!itemEl || !position) {
        return
      }

      const rect = itemEl.getBoundingClientRect()
      const newHeight = rect.height

      if (Math.abs(position.height - newHeight) > 1) {
        changes.push({ index, newHeight })
        if (firstChangedIndex === -1 || index < firstChangedIndex) {
          firstChangedIndex = index
        }
      }
    })

    if (changes.length === 0) {
      return
    }

    changes.forEach(({ index, newHeight }) => {
      if (positions.value[index]) {
        positions.value[index].height = newHeight
      }
    })

    if (firstChangedIndex !== -1) {
      for (let i = firstChangedIndex; i < positions.value.length; i++) {
        const position = positions.value[i]
        if (!position) {
          continue
        }

        if (i === 0) {
          position.top = 0
        } else {
          const prevPosition = positions.value[i - 1]
          if (prevPosition) {
            position.top = prevPosition.bottom
          }
        }
        position.bottom = position.top + position.height
      }
    }
  }

  const updateContainerHeight = () => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight
    }
  }

  watch(() => props.listData, () => {
    clearItemRefs()
    initPositions()
  }, { immediate: true })

  // 更新列表数据时，更新位置信息
  watch(() => renderList.value, () => {
    updatePositions()
  })

  onMounted(() => {
    if (!containerRef.value) {
      return
    }

    updateContainerHeight()
    containerRef.value.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('scroll', handleScroll)
    clearItemRefs()
  })

  return {
    containerRef,
    renderList,
    listHeight,
    listStyle,
    setItemRef,
    updateContainerHeight,
    getStartIndex,
  }
}
