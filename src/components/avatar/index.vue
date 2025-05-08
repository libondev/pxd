<script lang="ts" setup>
import { computed, inject, ref } from 'vue'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  src?: string
  size?: number | string
  loading?: boolean
}

defineOptions({
  name: 'PAvatar',
})

const props = defineProps<Props>()

defineEmits<{
  error: [Event]
}>()

const isLoadFailed = ref(false)

const groupSize = inject<number | string>('groupSize', 32)

const computedSize = computed(() => getCssUnitValue(props.size || groupSize))

const computedLoading = computed(() => props.loading || isLoadFailed.value)
</script>

<template>
  <div
    class="pxd-avatar inline-flex items-center justify-center relative rounded-full border border-white select-none size-(--s)"
    :style="{ '--s': computedSize }"
  >
    <slot>
      <img
        v-if="!computedLoading"
        :src="src"
        alt="avatar"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
        fetchpriority="low"
        crossorigin="anonymous"
        class="relative block rounded-inherit overflow-hidden w-full h-full"
        @error="$emit('error', $event)"
      >
    </slot>

    <div
      v-if="$slots.badge"
      class="absolute -bottom-1 -left-1 z-10 w-1/2 h-1/2 flex items-center rounded-full border border-white bg-white overflow-hidden"
    >
      <slot name="badge" />
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-avatar {
  &::before,
  &::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  &::before {
    background-image: linear-gradient(270deg, var(--gray-alpha-100), var(--gray-alpha-300), var(--gray-alpha-300), var(--gray-alpha-100));
    background-size: 400% 100%;
  }

  &::after {
    border: 1px solid var(--gray-alpha-400)
  }
}

@keyframes placeholder {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .pxd-avatar::before {
    animation: placeholder 8s ease-in-out infinite;
  }
}
</style>
