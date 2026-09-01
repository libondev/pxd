import { describe, expect, it } from 'vite-plus/test'
import { useOrderedChildren } from '../../src/composables/_internal/use-ordered-children'

function appendDivs(count: number) {
  const parent = document.createElement('div')
  const els = Array.from({ length: count }, () => document.createElement('div'))

  els.forEach((el) => parent.appendChild(el))
  document.body.appendChild(parent)

  return { parent, els }
}

describe('useOrderedChildren', () => {
  it('keeps setup registration order before elements exist', () => {
    const { items, register } = useOrderedChildren<string>()

    register('a', 'A')
    register('b', 'B')
    register('c', 'C')

    expect(items.value.map((item) => item.payload)).toEqual(['A', 'B', 'C'])
  })

  it('sorts by document position after elements are bound', () => {
    const { parent, els } = appendDivs(3)
    const { items, register } = useOrderedChildren<string>()

    register('c', 'C', els[2])
    register('a', 'A', els[0])
    register('b', 'B', els[1])

    expect(items.value.map((item) => item.payload)).toEqual(['A', 'B', 'C'])

    parent.remove()
  })

  it('restores document order after HMR-style reverse remount', () => {
    const { parent, els } = appendDivs(3)
    const { items, register, unregister } = useOrderedChildren<string>()

    register('a', 'A', els[0])
    register('b', 'B', els[1])
    register('c', 'C', els[2])

    register('c2', 'C', els[2])
    register('b2', 'B', els[1])
    register('a2', 'A', els[0])
    unregister('c')
    unregister('b')
    unregister('a')

    expect(items.value.map((item) => item.payload)).toEqual(['A', 'B', 'C'])

    parent.remove()
  })

  it('sorts by document position after a setup-only then bind pass', () => {
    const { parent, els } = appendDivs(3)
    const { items, register } = useOrderedChildren<string>()

    register('c', 'C')
    register('b', 'B')
    register('a', 'A')

    expect(items.value.map((item) => item.payload)).toEqual(['C', 'B', 'A'])

    register('a', 'A', els[0])
    register('b', 'B', els[1])
    register('c', 'C', els[2])

    expect(items.value.map((item) => item.payload)).toEqual(['A', 'B', 'C'])

    parent.remove()
  })

  it('updates payload in place without changing order', () => {
    const { parent, els } = appendDivs(2)
    const { items, register } = useOrderedChildren<string>()

    register('a', 'A', els[0])
    register('b', 'B', els[1])
    register('a', 'A-updated')

    expect(items.value.map((item) => item.payload)).toEqual(['A-updated', 'B'])

    parent.remove()
  })
})
