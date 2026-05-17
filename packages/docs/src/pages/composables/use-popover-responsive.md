# usePopoverResponsive

Returns responsive CSS classes for popover components (desktop/mobile).

## Exports

```ts
function usePopoverResponsive(): {
  isAdaptive: Ref<boolean>
  responsiveClasses: ComputedRef<{ content: string; wrapper: string }>
}
```
