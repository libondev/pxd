import { nextTick } from 'vue'

export async function flushPopover() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  await Promise.resolve()
}
