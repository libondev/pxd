# useFormItem

Reads the enclosing `PFormItem` context inside a custom control, so the control can pick up its id, invalid state and ARIA wiring without props from the caller.

## Exports

```ts
import { useFormItem } from 'pxd'
```

## Types

```ts
import type { FormItemContext } from 'pxd'
```

## Params

`useFormItem()` takes no arguments. It returns `FormItemContext | null`; `null` means the control is not inside a `PFormItem`.

```vue
<script setup lang="ts">
import { useFormItem } from 'pxd'

const item = useFormItem()
</script>

<template>
  <input
    :id="item?.id"
    :aria-invalid="item?.invalid || undefined"
    :aria-describedby="item?.describedBy || undefined"
    :aria-required="item?.required || undefined"
  />
</template>
```
