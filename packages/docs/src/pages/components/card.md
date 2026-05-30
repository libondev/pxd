# Card

Integrate information in a card container.

## Default

```vue demo
<template>
  <PCard>
    lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec suscipit auctor dui, sed efficitur nisl. Donec a nunc ac nisi efficitur convallis. Donec a nunc ac nisi efficitur convallis.
  </PCard>
</template>
```

## Shape

```vue demo
<template>
  <PCard shape="square">
    lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec suscipit auctor dui, sed efficitur nisl. Donec a nunc ac nisi efficitur convallis. Donec a nunc ac nisi efficitur convallis.
  </PCard>
</template>
```

## No Border

```vue demo
<template>
  <PCard :border="false">
    lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec suscipit auctor dui, sed efficitur nisl. Donec a nunc ac nisi efficitur convallis. Donec a nunc ac nisi efficitur convallis.
  </PCard>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| shape | `'square' \| 'rounded'` | `'rounded'` | - |
| border | `boolean` | `true` | - |

## Slots

| Name | Description |
| --- | --- |
| default | Card content |
| header | Card header |
| footer | Card footer |
