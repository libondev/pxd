<template>
  <svg viewBox="0 0 300 300" class="pxd-logo block size-em">
    <path class="shape fill-current stroke-current stroke-2 transform-origin-center" d="M 0,0 L 300,0 L 300,300 L 0,300 Z" />
  </svg>
</template>

<style scoped>
@keyframes morph {
  0%,
  100% {
    d: path('M 0,0 L 300,0 L 300,300 L 0,300 Z');
  }

  33% {
    d: path('M 150,0 L 261,44 L 300,150 L 261,256 L 150,300 L 39,256 L 0,150 L 39,44 Z');
  }

  66% {
    d: path('M 150,150 m-150,0 a 150,150 0 1,0 300,0 a 150,150 0 1,0 -300,0 Z');
  }
}

@media (prefers-reduced-motion: no-preference) {
  .shape {
    animation: morph 10s infinite ease-in-out;
  }
}
</style>
