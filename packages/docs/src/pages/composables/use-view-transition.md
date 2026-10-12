# useViewTransition

Animates route navigations using the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API), cross-fading the old view into the new one.

Call it once with your router instance. Navigations are wrapped in a view transition, and the transition is released once Vue has finished updating the DOM. Browsers without `document.startViewTransition` support are detected automatically and navigation proceeds unchanged, so no feature detection is needed.

## Exports

```ts
function useViewTransition(router: Router, options?: Options): () => void

interface Options {
  shouldTransition?: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `router` | `Router` | The vue-router instance to attach the navigation guards to |
| `options.shouldTransition` | `(to, from) => boolean` | Called before each navigation; returning `false` navigates without a transition |

## Returns

| Name | Type | Description |
| --- | --- | --- |
| `dispose` | `() => void` | Removes the registered navigation guards |

## Example

```ts
import { useViewTransition } from 'pxd'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

useViewTransition(router)
```

## Notes

- Call it after the router is created. Calls for the same router share one registration, and the guards are removed once every caller has disposed.
- Every caller may pass its own `shouldTransition`, and any of them returning `false` skips the animation for that navigation.
- The returned disposer turns animations off for the whole router, and it releases a navigation that is already in flight instead of leaving it blocked.
- Use `shouldTransition` for the navigations that should not animate — the first one after load (`from.matched.length === 0`) and hash-only moves (`to.path === from.path`) are the common cases:

```ts
useViewTransition(router, {
  shouldTransition: (to, from) => from.matched.length > 0 && to.path !== from.path,
})
```

- Style the transition through the `::view-transition` pseudo-elements; the default is a cross-fade.

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.25s;
}
```
