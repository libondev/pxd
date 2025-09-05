<script lang="ts" setup>
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed, onMounted, ref, watch } from 'vue'
import { useCollapseGroupContext } from '../../contexts/collapse'
import { getUniqueId } from '../../utils/uid'

interface Props {
  title?: string
  expand?: boolean
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
const collapseGroup = useCollapseGroupContext()

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
  <div class="pxd-collapse group/collapse border-b">
    <h3 class="pxd-collapse--title">
      <button
        class="pxd-collapse--trigger pr-1 group/collapse flex w-full cursor-pointer touch-manipulation appearance-none items-center justify-between border-none bg-transparent self-focus-ring outline-none"
        :data-state="isExpanded ? 'open' : 'closed'"
        @click="onTriggerClick"
      >
        <slot name="title">
          {{ title }}
        </slot>

        <ChevronDownIcon class="size-4 shrink-0 group-data-[state=open]/collapse:-rotate-180 motion-safe:transition-transform" />
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
  padding-block: var(--s, 24px);
  font-size: var(--fs, 24px);
  font-weight: var(--fw, 600);
}

.pxd-transition--collapse-enter-active,
.pxd-transition--collapse-leave-active {
  transition: height var(--default-transition-duration) var(--default-transition-timing-function);
}
</style>
