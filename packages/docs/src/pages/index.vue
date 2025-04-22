<script setup>
import { ArrowRightIcon } from 'gdsi/vue'
import { ref } from 'vue'

const router = useRouter()
const showArrowIcon = ref(false)

function onTrigger() {
  showArrowIcon.value = true
}

function onCanceled() {
  showArrowIcon.value = false
}

function onFinished(isFinished) {
  if (!isFinished) {
    return
  }

  router.push('/guide')
}
</script>

<template>
  <main class="flex flex-col justify-center sm:h-screen sm:-mt-12 py-40 px-4 text-center relative max-w-2xl mx-auto mb-32">
    <h1 class="text-balance text-6xl font-bold">
      PXD
    </h1>

    <p class="leading-tight text-lg text-secondary text-pretty mt-8">
      A universal UI component library for Vue2&3
    </p>

    <div class="mt-16">
      <PHoldButton
        cancelable
        durations=".5"
        :scale="false"
        shape="rounded"
        variant="primary"
        mask-color="hsl(var(--green-600-value))"
        @confirm="onTrigger"
        @finished="onFinished"
        @canceled="onCanceled"
      >
        Get Started

        <template #suffix>
          <Transition name="fade">
            <ArrowRightIcon v-if="showArrowIcon" class="animate-[bounce-right_1s_ease-out_infinite]" />
          </Transition>
        </template>
      </PHoldButton>
    </div>
  </main>
</template>

<style>
.fade-enter-active {
  transform: scale(1);
  opacity: 1;
  width: 1em;
}

.fade-enter-active,
.fade-leave-active {
  transition: transform .15s ease-out, width .15s ease-out, opacity .15s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  transform: scale(.68);
  opacity: 0;
  width: 0;
}

@keyframes bounce-right {
  0%, 100% {
    transform: translateX(-20%) scale(1) translateZ(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }

  50% {
    transform: translateX(45%) scale(0.68) translateZ(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
