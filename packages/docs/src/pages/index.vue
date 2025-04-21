<script setup>
import { ArrowRightIcon } from 'gdsi/vue'
import { ref } from 'vue'

const router = useRouter()
const showArrowIcon = ref(false)

function onTrigger() {
  showArrowIcon.value = true
}

function onConfirm(isConfirm) {
  showArrowIcon.value = false

  if (isConfirm) {
    router.push('/about')
  }
}
</script>

<template>
  <main class="px-4 py-24 text-center sm:py-32 md:py-48 relative max-w-2xl mx-auto mb-32">
    <h1 class="text-balance text-6xl font-bold">
      PXD
    </h1>

    <p class="leading-tight text-lg text-secondary mt-8">
      A universal UI component library for Vue2&3
    </p>

    <div class="mt-16">
      <PHoldButton
        shape="rounded" durations="1"
        mask-color="hsl(var(--blue-600-value))"
        :scale="false"
        variant="primary"
        @trigger="onTrigger"
        @confirm="onConfirm"
      >
        Get Started

        <template #suffix>
          <Transition name="fade">
            <ArrowRightIcon v-if="showArrowIcon" />
          </Transition>
        </template>
      </PHoldButton>
    </div>
  </main>
</template>

<style>
.fade-enter-active {
  transform: scale(1);
  transition: transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  transform: scale(0);
}
</style>
