<script lang="ts" setup>
import type { ComputedRef } from 'vue'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { getUniqueId } from '../../utils/uid'

interface Props {
  title?: string
  expand?: boolean
}

interface CollapseGroupContext {
  multiple: ComputedRef<boolean>
  isExpanded: (id: string) => boolean
  toggleItem: (id: string, expanded: boolean) => void
}

defineOptions({
  name: 'PCollapse',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    title: '',
    expand: false,
  },
)

const uid = getUniqueId()

const localExpand = ref(props.expand)
const collapseGroup = inject<CollapseGroupContext | null>('collapseGroup', null)

const isExpanded = computed(() => {
  if (collapseGroup) {
    return collapseGroup.isExpanded(uid)
  }

  return localExpand.value
})

if (!collapseGroup) {
  watch(
    () => props.expand,
    (expand) => {
      localExpand.value = expand
    },
    { immediate: true },
  )
}

function onTriggerClick() {
  const newState = !isExpanded.value

  if (collapseGroup) {
    collapseGroup.toggleItem(uid, newState)
    return
  }

  localExpand.value = newState
}

function beforeEnter(el: Element) {
  (el as HTMLElement).style.height = '0';
  (el as HTMLElement).style.overflow = 'hidden'
}

function enter(el: Element) {
  // 强制回流，确保元素高度已经计算完成
  void (el as HTMLElement).offsetHeight;
  (el as HTMLElement).style.height = `${el.scrollHeight}px`
}

function afterEnter(el: Element) {
  (el as HTMLElement).style.height = '';
  (el as HTMLElement).style.overflow = ''
}

function beforeLeave(el: Element) {
  (el as HTMLElement).style.height = `${el.scrollHeight}px`;
  (el as HTMLElement).style.overflow = 'hidden'
  void (el as HTMLElement).offsetHeight
}

function leave(el: Element) {
  (el as HTMLElement).style.height = '0'
}

onMounted(() => {
  if (props.expand && collapseGroup) {
    collapseGroup.toggleItem(uid, true)
  }
})
</script>

<template>
  <div class="pxd-collapse border-b">
    <h3 class="pxd-collapse--title">
      <button
        class="pxd-collapse--trigger flex items-center justify-between w-full pr-1 appearance-none group/collapse cursor-pointer outline-none border-none bg-transparent self-focus-ring"
        :data-state="isExpanded ? 'open' : 'closed'"
        @click="onTriggerClick"
      >
        <slot name="title">
          {{ title }}
        </slot>

        <ChevronDownIcon class="flex-shrink-0 size-4 group-data-[state=open]/collapse:-rotate-180 motion-safe:transition-transform" />
      </button>
    </h3>

    <Transition
      name="pxd-transition--collapse"
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <div v-show="isExpanded" class="pxd-collapse--content">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style>
.pxd-collapse--trigger {
  padding-block: var(--size, 24px);
  font-size: var(--font-size, 24px);
  font-weight: var(--font-weight, 600);
}

.pxd-collapse--content {
  will-change: height;
}

@media (prefers-reduced-motion: no-preference) {
  .pxd-transition--collapse-enter-active,
  .pxd-transition--collapse-leave-active {
    transition: height var(--default-transition-duration) var(--default-transition-timing-function);
  }
}
</style>
