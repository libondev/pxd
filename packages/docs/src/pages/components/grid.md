# Grid
Display elements in a grid layout.

## Default

```vue demo
<template>
  <PGrid :rows="2" :columns="3">
    <PGridItem
      v-for="i of 6"
      :key="i"
    >{{ i }}</PGridItem>
  </PGrid>
</template>

<style>
.pxd-grid {
  min-height: 200px;
  border-top: 1px solid;
  border-left: 1px solid;
  border-color: hsl(var(--color-gray-300-value));
}

.pxd-grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid;
  border-bottom: 1px solid;
  border-color: hsl(var(--color-gray-300-value));
}
</style>
```

## Responsive Grid with responsive guide clipping cells
Grid component with responsive rows and columns props at all 3 breakpoints as well as guide clipping on specific cells.

```vue demo
<template>
  <PGrid :columns="{ sm: 1, md: 2, lg: 3 }" :rows="{ sm: 6, md: 3, lg: 2 }">
    <PGridItem
      :column="{ sm: 1, sm: '1/3' }"
      :row="{ sm: '1/3', md: 1 }"
    >1 + 2</PGridItem>
    <PGridItem>3</PGridItem>
    <PGridItem>4</PGridItem>
    <PGridItem
      :column="{ sm: 1, md: '1/3', lg: '2/4' }"
      :row="{ ld: 3, lg: 2 }"
    >5 + 6</PGridItem>
  </PGrid>
</template>
```
