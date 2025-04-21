<template>
  <svg viewBox="0 0 300 300" class="pxd-logo block" width="1em" height="1em">
    <path class="shape fill-current stroke-current stroke-2 transform-origin-center" d="M 0,0 L 300,0 L 300,300 L 0,300 Z" />
  </svg>
</template>

<style scoped>
@keyframes morph {
  0%,
  100% {
    d: path('M 0,0 L 300,0 L 300,300 L 0,300 Z');
  }

  25% {
    d: path('M 150,0 L 300,300 L 0,300 Z');
  }

  50% {
    d: path('M 150,0 L 300,120 L 255,300 L 45,300 L 0,120 Z');
  }

  75% {
    d: path('M 150,0 A 150,150 0 1,1 149.85,0 Z');
  }
}

@media (prefers-reduced-motion: no-preference) {
  .shape {
    animation: morph 5s infinite ease-in-out;
  }
}
</style>
