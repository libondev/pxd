# Loading Mask

Cover an element with a spinner and a loading hint. Locks the scroll of the containing element while visible.

## Default

```vue demo
<template>
  <div class="relative h-32 max-w-full overflow-hidden rounded-lg border border-border">
    <div class="flex h-full items-center justify-center text-sm text-foreground-secondary">
      Content behind the mask
    </div>

    <PLoadingMask />
  </div>
</template>
```

## Custom text

```vue demo
<template>
  <div class="relative h-32 max-w-full overflow-hidden rounded-lg border border-border">
    <div class="flex h-full items-center justify-center text-sm text-foreground-secondary">
      Content behind the mask
    </div>

    <PLoadingMask text="Fetching..." />
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | `string` | `Loading...` | Hint text shown next to the spinner |
