<script setup>
import { githubLink } from '@/consts/link'
import { ArrowRightIcon, StarFillIcon } from 'gdsi/vue'
import { version } from 'pxd'
import { MEDIA_QUERY, useMediaQuery } from 'pxd/composables'
import { ref } from 'vue'

const router = useRouter()
const showArrowIcon = ref(false)

const reduceMotion = useMediaQuery(MEDIA_QUERY.MOTION_REDUCE)

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
  <main class="flex flex-col justify-center sm:h-screen sm:-mt-13 py-40 px-4 text-center relative max-w-2xl mx-auto">
    <div class="relative">
      <h1 class="font-bold inline text-6xl">
        PXD
      </h1>

      <PBadge variant="vue" class="absolute top-0">
        v{{ version }}
      </PBadge>
    </div>

    <p class="text-balance leading-tight text-lg text-secondary text-pretty mt-8">
      A universal UI component library for Vue2&3
    </p>

    <div class="mt-16 justify-center flex gap-2">
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
          <template v-if="reduceMotion">
            <ArrowRightIcon v-if="showArrowIcon" class="animate-[bounce-right_1s_ease-out_infinite]" />
          </template>
          <Transition v-else name="scale-fade">
            <ArrowRightIcon v-if="showArrowIcon" class="animate-[bounce-right_1s_ease-out_infinite]" />
          </Transition>
        </template>
      </PHoldButton>

      <PLinkButton :href="githubLink" target="_blank" external-icon shape="rounded" variant="outline">
        <template #prefix>
          <StarFillIcon class="text-amber-600" />
        </template>

        Star on GitHub
      </PLinkButton>
    </div>
  </main>
</template>

<style>
@media (prefers-reduced-motion: no-preference) {
  .scale-fade-enter-active {
    transform: scale(1);
    opacity: 1;
    width: 1em;
  }

  .scale-fade-enter-active,
  .scale-fade-leave-active {
    transition: transform .15s ease-out, width .15s ease-out, opacity .15s ease-out;
  }

  .scale-fade-enter-from,
  .scale-fade-leave-to {
    transform: scale(.68);
    opacity: 0;
    width: 0;
  }

  @keyframes bounce-right {

    0%,
    100% {
      transform: translateX(-20%) scale(1) translateZ(0);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }

    50% {
      transform: translateX(45%) scale(0.68) translateZ(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
}
</style>
