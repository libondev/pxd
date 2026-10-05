<script lang="ts" setup>
import type { ComponentClass, ComponentValue } from '../../types/shared'
import type { TreeDropPosition, TreeHighlightPart, TreeOption } from '../tree/types'
import CheckIcon from '@gdsicon/vue/check'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import FolderClosedIcon from '@gdsicon/vue/folder-closed'
import FolderOpenIcon from '@gdsicon/vue/folder-open'
import MinusIcon from '@gdsicon/vue/minus'
import MoreVerticalIcon from '@gdsicon/vue/more-vertical'
import { computed } from 'vue'

defineOptions({
  name: 'PTreeNode',
})

/**
 * The row state is passed field by field instead of as the flat node it was flattened from:
 * `useTreeRows` rebuilds every row object whenever any node changes, so an object prop would
 * carry a new identity to every row on every selection, and no row could ever be skipped.
 */
const props = defineProps<{
  node: TreeOption
  value: ComponentValue
  depth: number
  index: number
  hasChildren: boolean
  expanded: boolean
  checked: boolean
  indeterminate: boolean
  active: boolean
  multiple: boolean
  disabled: boolean
  setSize: number
  indent: number
  id: string
  highlightQuery: string
  showIcon: boolean
  draggable: boolean
  dragHandle: boolean
  dragging: boolean
  dropPosition?: TreeDropPosition
  itemClass?: ComponentClass
}>()

const emits = defineEmits<{
  'row-click': [value: ComponentValue]
  check: [value: ComponentValue]
  toggle: [value: ComponentValue]
  'drag-pointerdown': [value: ComponentValue, event: PointerEvent]
}>()

function onPointerdown(event: PointerEvent): void {
  // A handle owns the gesture on touch, where a vertical drag is indistinguishable from a scroll.
  if (!props.draggable || props.dragHandle) {
    return
  }

  emits('drag-pointerdown', props.value, event)
}

const disabled = computed(() => props.disabled || props.node.disabled === true)

const checkboxClass = computed(() => {
  if (props.checked) {
    return disabled.value ? 'border-gray-500 bg-gray-500' : 'border-primary bg-primary'
  }

  return disabled.value ? 'border-gray-500 bg-gray-100' : 'border-gray-alpha-400 bg-background-100'
})

const parts = computed<TreeHighlightPart[] | undefined>(() => {
  const query = props.highlightQuery

  if (!query) {
    return undefined
  }

  const label = String(props.node.label ?? '')
  const at = label.toLowerCase().indexOf(query.toLowerCase())

  if (at === -1) {
    return undefined
  }

  return [
    { text: label.slice(0, at), matched: false },
    { text: label.slice(at, at + query.length), matched: true },
    { text: label.slice(at + query.length), matched: false },
  ].filter((part) => part.text)
})
</script>

<template>
  <div
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
    :aria-selected="multiple ? undefined : checked"
    :aria-checked="multiple ? (indeterminate ? 'mixed' : checked) : undefined"
    :aria-setsize="setSize"
    :aria-posinset="index + 1"
    :style="{ paddingInlineStart: depth * indent + 8 + 'px' }"
    :class="[
      'pxd-tree--node group/row min-h-8 py-1 pe-2 gap-1 text-sm relative flex w-full max-w-full cursor-pointer items-center rounded-md text-foreground outline-none select-none active:bg-gray-alpha-100 pointer-fine:hover:bg-gray-alpha-100',
      itemClass,
      {
        'bg-primary! text-primary-foreground!': checked,
        'ring-primary data-[active=true]:ring-1': active,
        'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gray-500': disabled,
        'opacity-40': dragging,
        'before:inset-x-0 before:h-0.5 before:absolute before:bg-primary':
          dropPosition === 'before' || dropPosition === 'after',
        'before:-top-px': dropPosition === 'before',
        'before:bottom-px': dropPosition === 'after',
      },
    ]"
    @click="emits('row-click', value)"
    @pointerdown="onPointerdown"
    @dragstart.prevent
  >
    <slot
      name="node"
      :node="node"
      :depth="depth"
      :expanded="expanded"
      :checked="checked"
      :indeterminate="indeterminate"
    >
      <span
        v-if="dragHandle"
        data-tree-drag-handle
        class="pxd-tree--drag-handle size-4 me-0.5 inline-flex shrink-0 cursor-grab items-center justify-center opacity-0 group-hover/row:opacity-60 group-data-[dragging=true]/row:opacity-60 motion-safe:transition-opacity"
        @pointerdown.stop="emits('drag-pointerdown', value, $event)"
      >
        <slot name="node-drag-handle" :node="node" :depth="depth">
          <MoreVerticalIcon class="size-3" />
        </slot>
      </span>

      <span
        v-if="multiple"
        aria-hidden="true"
        class="pxd-tree--checkbox size-4 p-0.5 inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border text-primary-foreground"
        :class="checkboxClass"
        @click.stop="emits('check', value)"
      >
        <CheckIcon v-if="checked" class="size-3" />
        <MinusIcon v-else-if="indeterminate" class="size-3" />
        <span v-else class="size-3" />
      </span>

      <span
        v-if="hasChildren"
        data-tree-switcher
        class="pxd-tree--switcher size-4 inline-flex shrink-0 items-center justify-center rounded-sm opacity-60"
        @click.stop="emits('toggle', value)"
      >
        <slot name="node-switcher" :node="node" :depth="depth" :expanded="expanded">
          <ChevronRightIcon
            class="size-4 motion-safe:transition-transform"
            :class="{ 'rotate-90': expanded }"
          />
        </slot>
      </span>
      <span v-else aria-hidden="true" class="pxd-tree--switcher size-4 shrink-0 empty:hidden" />

      <span
        v-if="showIcon"
        aria-hidden="true"
        class="pxd-tree--icon size-4 mr-0.5 inline-flex shrink-0 items-center justify-center opacity-60"
      >
        <slot name="node-icon" :node="node" :depth="depth" :expanded="expanded">
          <FolderOpenIcon v-if="expanded" class="size-4" />
          <FolderClosedIcon v-else-if="hasChildren" class="size-4" />
        </slot>
      </span>

      <span class="pxd-tree--content min-w-0 flex-1 truncate">
        <slot name="node-content" :node="node" :depth="depth">
          <template v-if="parts">
            <mark
              v-for="(part, partIndex) in parts"
              :key="partIndex"
              class="pxd-tree--match bg-transparent text-inherit"
              :class="{ 'bg-yellow-200 text-yellow-900': part.matched }"
              >{{ part.text }}</mark
            >
          </template>
          <template v-else>{{ node.label }}</template>
        </slot>
      </span>

      <slot name="node-suffix" :node="node" />
    </slot>
  </div>
</template>
