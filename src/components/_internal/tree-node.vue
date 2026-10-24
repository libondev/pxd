<script lang="ts" setup>
import type { ComponentClass, ComponentLabel, ComponentValue } from '../../types/shared/props'
import type { TreeDropPosition, TreeHighlightPart, TreeOption } from '../tree/types'
import CheckIcon from '@gdsicon/vue/check'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import MinusIcon from '@gdsicon/vue/minus'
import { computed } from 'vue'

defineOptions({
  name: 'PTreeNode',
  inheritAttrs: false,
})

const props = defineProps<{
  node: TreeOption
  label: ComponentLabel
  value: ComponentValue
  depth: number
  index: number
  hasChildren: boolean
  expanded: boolean
  loading: boolean
  checked: boolean
  indeterminate: boolean
  active: boolean
  multiple: boolean
  disabled: boolean
  nodeDisabled: boolean
  selectable: boolean
  showSwitcher: boolean
  showCheckbox: boolean
  setSize: number
  indent: number
  id: string
  highlightQuery: string
  draggable: boolean
  dragging: boolean
  dropPosition?: TreeDropPosition
  itemClass?: ComponentClass
}>()

const emits = defineEmits<{
  check: [value: ComponentValue, event: MouseEvent]
  toggle: [value: ComponentValue]
  'row-click': [value: ComponentValue, event: MouseEvent]
  'row-contextmenu': [value: ComponentValue, event: MouseEvent]
  'drag-pointerdown': [value: ComponentValue, event: PointerEvent]
}>()

const disabled = computed(() => props.disabled || props.nodeDisabled)

const unavailable = computed(() => disabled.value || !props.selectable)

const checkboxClass = computed(() => {
  if (props.checked) {
    return unavailable.value ? 'border-gray-500 bg-gray-500' : 'border-primary bg-primary'
  }

  return unavailable.value
    ? 'border-gray-500 bg-gray-100 cursor-not-allowed'
    : 'border-gray-alpha-400 bg-background-100'
})

const indentSize = computed(() => Math.max(props.depth * props.indent, 8))

const parts = computed<TreeHighlightPart[] | undefined>(() => {
  const query = props.highlightQuery

  if (!query) {
    return undefined
  }

  const text = String(props.label ?? '')
  const at = text.toLowerCase().indexOf(query.toLowerCase())

  if (at === -1) {
    return undefined
  }

  return [
    { text: text.slice(0, at), matched: false },
    { text: text.slice(at, at + query.length), matched: true },
    { text: text.slice(at + query.length), matched: false },
  ].filter((part) => part.text)
})

function onPointerdown(event: PointerEvent): void {
  if (!props.draggable) {
    return
  }

  emits('drag-pointerdown', props.value, event)
}
</script>

<template>
  <div
    data-tree-node
    :id="id"
    role="treeitem"
    data-tree-item
    :data-index="index"
    :data-key="value"
    :data-checked="checked"
    :data-active="active"
    :data-indeterminate="indeterminate"
    :data-disabled="disabled"
    :data-dragging="dragging"
    :data-drop="dropPosition"
    :aria-level="depth + 1"
    :aria-expanded="hasChildren ? expanded : undefined"
    :aria-busy="loading || undefined"
    :aria-selected="multiple ? undefined : checked"
    :aria-checked="multiple ? (indeterminate ? 'mixed' : checked) : undefined"
    :aria-setsize="setSize"
    :aria-posinset="index + 1"
    :aria-disabled="disabled || undefined"
    :style="{ paddingInlineStart: indentSize + 'px', '--node-indent': indentSize + 'px' }"
    class="pxd-tree--node group/row min-h-8 py-1 pe-1 gap-1 text-sm relative flex w-full max-w-full cursor-pointer items-center rounded-md text-foreground outline-none select-none hover:bg-gray-100"
    :class="[
      itemClass,
      {
        'bg-gray-200!': checked,
        'z-1 ring-primary data-[active=true]:ring-1': active,
        'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gray-500': disabled,
        'opacity-40': dragging,
        'bg-gray-300 ring-1 ring-primary': dropPosition === 'inside',
        'before:end-0 before:absolute before:start-(--node-indent) before:border-t-2 before:bg-primary':
          dropPosition === 'before' || dropPosition === 'after',
        'before:-top-px': dropPosition === 'before',
        'before:bottom-0': dropPosition === 'after',
      },
    ]"
    v-bind="$attrs"
    @click="emits('row-click', value, $event)"
    @contextmenu="emits('row-contextmenu', value, $event)"
    @pointerdown="onPointerdown"
    @dragstart.prevent
  >
    <span
      v-if="showSwitcher && hasChildren"
      data-tree-switcher
      tabindex="-1"
      class="pxd-tree--switcher size-4 relative inline-flex shrink-0 items-center justify-center rounded-sm motion-safe:after:transition-colors"
      @click.stop="emits('toggle', value)"
    >
      <slot
        name="node-switcher"
        :node="node"
        :depth="depth"
        :loading="loading"
        :expanded="expanded"
      >
        <LoaderCircleIcon v-if="loading" class="size-3 motion-safe:animate-spin" />
        <ChevronRightIcon
          v-else
          class="size-3 motion-safe:transition-transform"
          :class="{ 'rotate-90': expanded }"
        />
      </slot>
    </span>
    <span v-else-if="showSwitcher" aria-hidden="true" class="pxd-tree--switcher size-4 shrink-0" />

    <span
      v-if="showCheckbox && multiple"
      aria-hidden="true"
      :data-selectable="selectable"
      class="pxd-tree--checkbox size-4 p-0.5 inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border text-primary-foreground"
      :class="checkboxClass"
      @click.stop="emits('check', value, $event)"
    >
      <CheckIcon v-if="checked" class="size-3" />
      <MinusIcon v-else-if="indeterminate" class="size-3" />
      <span v-else class="size-3" />
    </span>

    <span
      v-if="$slots['node-icon']"
      aria-hidden="true"
      class="pxd-tree--icon size-4 inline-flex shrink-0 items-center justify-center"
    >
      <slot
        name="node-icon"
        :node="node"
        :depth="depth"
        :loading="loading"
        :expanded="expanded"
        :has-children="hasChildren"
      />
    </span>

    <span class="pxd-tree--content min-w-0 flex-1 truncate">
      <slot
        name="node-content"
        :node="node"
        :depth="depth"
        :parts="parts"
        :loading="loading"
        :expanded="expanded"
        :has-children="hasChildren"
      >
        <template v-if="parts">
          <mark
            v-for="(part, partIndex) in parts"
            :key="partIndex"
            class="pxd-tree--match bg-transparent text-inherit"
            :class="{ 'bg-yellow-200 text-yellow-900': part.matched }"
            >{{ part.text }}</mark
          >
        </template>
        <template v-else>{{ label }}</template>
      </slot>
    </span>

    <slot
      name="node-suffix"
      :node="node"
      :depth="depth"
      :loading="loading"
      :expanded="expanded"
      :has-children="hasChildren"
    />
  </div>
</template>

<style lang="postcss">
.pxd-tree--switcher.relative {
  &::after {
    content: '';
    width: 125%;
    height: 125%;
    position: absolute;
    left: 50%;
    top: 50%;
    border-radius: inherit;
    transform: translate(-50%, -50%);
  }

  &:hover::after {
    background-color: var(--color-gray-alpha-200);
  }

  &:active::after {
    background-color: var(--color-gray-alpha-300);
  }
}
</style>
