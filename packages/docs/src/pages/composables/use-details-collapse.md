# useDetailsCollapse

Drives a native `<details>` element whose content expands and collapses through a `grid-template-rows` transition, keeping the content mounted until the leave transition ends.

Bind `detailsOpen` to the `<details>` `open` attribute, `onDetailsToggle` to its `toggle` event, `onToggleClick` to the summary click, and the row class to `isOpen`.

## Exports

```ts
function useDetailsCollapse(
  content: MaybeElementRef<HTMLElement>,
  open: MaybeRefOrGetter<boolean>,
): UseDetailsCollapseReturn
```

## Types

```ts
interface UseDetailsCollapseReturn {
  isOpen: ShallowRef<boolean>
  detailsOpen: ShallowRef<boolean>
  onToggleClick: () => void
  onDetailsToggle: (ev: Event) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `content` | `MaybeElementRef<HTMLElement>` | The collapsing content element; its `transition-duration` decides when leave completes |
| `open` | `MaybeRefOrGetter<boolean>` | Controlled open state; a change enters or leaves the collapse |
