import type { VNode } from 'vue'
import { isVue3 } from './is'

interface ParsedVNode {
  name: string | undefined
  props: Record<string, any>
  children: any[]
}

function parseVNode(vnode: any): ParsedVNode {
  if (isVue3()) {
    const { type, props, children } = vnode
    let normalizedChildren: any[] = []

    if (Array.isArray(children)) {
      normalizedChildren = children
    } else if (children && typeof children === 'object') {
      for (const slotFn of Object.values(children)) {
        if (typeof slotFn !== 'function') continue
        const nodes = (slotFn as () => unknown)()
        if (Array.isArray(nodes)) normalizedChildren.push(...nodes)
      }
    }

    return { name: type?.name, props: props ?? {}, children: normalizedChildren }
  }

  const { componentOptions } = vnode
  return {
    name: componentOptions?.Ctor?.options?.name,
    props: componentOptions?.propsData ?? {},
    children: componentOptions?.children ?? [],
  }
}

/**
 * Traverse a VNode tree and collect transformed props from all nodes whose
 * component name matches `componentName`. Recurses into wrapper components,
 * fragments, and v-for rendered nodes. Return `null` from `transform` to skip.
 */
export function collectVNodeProps<T>(
  vnodes: VNode[] | undefined,
  componentName: string,
  transform: (props: Record<string, any>) => T | null,
): T[] {
  if (!vnodes?.length) return []

  const result: T[] = []
  for (const vnode of vnodes) {
    if (!vnode) continue
    const { name, props, children } = parseVNode(vnode)

    if (name === componentName) {
      const transformed = transform(props)
      if (transformed !== null) result.push(transformed)
    }
    if (children.length) {
      result.push(...collectVNodeProps(children, componentName, transform))
    }
  }
  return result
}
