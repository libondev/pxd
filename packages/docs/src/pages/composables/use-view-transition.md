# useViewTransition

Animates route navigations using the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API), cross-fading the old view into the new one.

Call it once with your router instance. Navigations are wrapped in a view transition, and the transition is released once Vue has finished updating the DOM. Browsers without `document.startViewTransition` support are detected automatically and navigation proceeds unchanged, so no feature detection is needed.

## Exports

```ts
function useViewTransition(router: Router): () => void
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `router` | `Router` | The vue-router instance to attach the navigation guards to |

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

- Call it after the router is created. Calling it more than once registers the guards more than once.
- The returned disposer is useful when the router is torn down, or when transitions should be disabled for part of the app.
- Style the transition through the `::view-transition` pseudo-elements; the default is a cross-fade.

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.25s;
}
```

- A navigation interrupted by a newer one does not leak a pending transition.