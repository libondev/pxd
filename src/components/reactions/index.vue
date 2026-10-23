<script lang="ts" setup>
import type { Reaction, ReactionsEmits, ReactionsProps } from './types'
import { computed, shallowRef } from 'vue'
import { getUniqueId } from '../../utils/helper.js'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PReactions',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ReactionsProps>(), {
  modelValue: () => [],
  emojis: () => ['👍', '❤️', '😂', '😮', '😢', '🙏'],
  trigger: 'click',
  position: 'top-start',
})

const emits = defineEmits<ReactionsEmits>()

const labelId = getUniqueId('pxd-reactions-label')

const visible = shallowRef(false)

const reactions = computed(() => props.modelValue ?? [])

function commit(next: Reaction[], event: 'add' | 'remove', emoji: string) {
  if (event === 'add') {
    emits('add', emoji)
  } else {
    emits('remove', emoji)
  }

  emits('change', next)
  emits('update:modelValue', next)
}

function pick(emoji: string) {
  if (props.disabled) {
    return
  }

  const current = reactions.value
  const existing = current.find((item) => item.emoji === emoji)

  visible.value = false

  if (existing?.mine) {
    return
  }

  commit(
    existing
      ? current.map((item) =>
          item.emoji === emoji ? { ...item, count: item.count + 1, mine: true } : item,
        )
      : [...current, { emoji, count: 1, mine: true }],
    'add',
    emoji,
  )
}

function toggle(emoji: string) {
  if (props.disabled) {
    return
  }

  const current = reactions.value
  const existing = current.find((item) => item.emoji === emoji)

  if (!existing) {
    return
  }

  if (!existing.mine) {
    commit(
      current.map((item) =>
        item.emoji === emoji ? { ...item, count: item.count + 1, mine: true } : item,
      ),
      'add',
      emoji,
    )
    return
  }

  commit(
    existing.count > 1
      ? current.map((item) =>
          item.emoji === emoji ? { ...item, count: item.count - 1, mine: false } : item,
        )
      : current.filter((item) => item.emoji !== emoji),
    'remove',
    emoji,
  )
}

defineExpose({
  pick,
  toggle,
})
</script>

<template>
  <PPopover
    data-reactions
    v-model="visible"
    class="pxd-reactions"
    :trigger="trigger"
    :position="position"
    :disabled="disabled"
    :aria-labelledby="labelId"
    content-class="pxd-reactions--picker p-1 gap-0.5 shadow-lg flex items-center rounded-lg border border-gray-alpha-300 bg-background-100"
    :fill-trigger-width="false"
    v-bind="$attrs"
  >
    <slot />

    <template #content>
      <span :id="labelId" class="visually-hidden">Add a reaction</span>

      <button
        v-for="emoji in emojis"
        :key="emoji"
        type="button"
        :aria-label="emoji"
        class="size-8 p-0 text-base inline-flex cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent font-inherit leading-none self-focus-ring outline-none hover:bg-background-hover motion-safe:transition-colors"
        @click="pick(emoji)"
      >
        {{ emoji }}
      </button>
    </template>
  </PPopover>
</template>
