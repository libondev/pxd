<script lang="ts" setup>
import { isPlainObject, isString, isSymbol } from '@vue/shared'
import { useSlots } from 'vue'


const slots = useSlots()
// console.info('🍭CodeBlock.vue:6/(slots):\n', slots.default!(), transformVNodeToString(slots.default!()))
console.info(transformVNodeToString(slots.default!()))

function transformProps(props: any) {
  if (!props) return ''

  return Object.keys(props).map((key) => {
    let str = key

    if (props[key] !== '') {
      str += `="${props[key]}"`
    }

    return str
  }).join(' ')
}

function transformVNodeToString(node: any) {
  // 如果是文本节点，直接返回文本内容
  let tag: string = ''
  let attrs: string = ''
  let children: string = ''

  if (Array.isArray(node)) {
    children = node.map(transformVNodeToString).join('\n')
  }

  if (isPlainObject(node.type)) {
    tag = node.type.name
    attrs = transformProps(node.props)
  } else if (isString(node.type)) {
    tag = node.type
  } else if (isSymbol(node.type)) {
    if (node.type.description === 'v-txt') {
      children = node.children
    }
  }

  if (isString(node.children)) {
    children = node.children
  } else if (isPlainObject(node.children)) {
    if (typeof node.children.default === 'function') {
      children = transformVNodeToString(node.children.default())
    } else {
      children = transformVNodeToString(node.children)
    }
  }

  let str = ''

  if (tag) {
    str += `<${tag}`

    if (attrs) {
      str += ` ${attrs}`
    }

    str += '>\n'
  }

  if (children) {
    str += children
  }

  if (tag) {
    str += `\n</${tag}>`
  }

  return str
}
</script>

<template>
  <div ref="containerRef" class="code-block-container">
    <!-- 组件形式展示 -->
    <div class="component-preview" />

    <div>
      <slot />
    </div>

    <pre class="text-background">{{ transformVNodeToString(slots.default!()) }}</pre>
  </div>
</template>
