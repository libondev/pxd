# Grid

Display elements in a grid layout.

## Default

```vue demo
<template>
  <PGrid class="min-h-40" :rows="2" :columns="3" debug>
    <PGridItem v-for="i of 6" :key="i">{{ i }}</PGridItem>
  </PGrid>
</template>

<style>
.pxd-grid-item {
  display: flex;
  align-items: center;
  padding-inline: 24px;
}
</style>
```

## Responsive Grid with responsive guide clipping cells

Grid component with responsive rows and columns props at all 3 breakpoints as well as guide clipping on specific cells.

```vue demo
<template>
  <PGrid class="min-h-40" :columns="{ sm: 1, md: 2, lg: 3 }" :rows="{ sm: 6, md: 3, lg: 2 }" debug>
    <PGridItem :column="{ sm: '1', md: '1/3' }" :row="{ sm: '1/3', md: 1 }">1 + 2</PGridItem>
    <PGridItem>3</PGridItem>
    <PGridItem>4</PGridItem>
    <PGridItem :column="{ sm: 1, md: '1/3', lg: '2/4' }" :row="{ sm: '5/7', md: 3, lg: 2 }"
      >5 + 6</PGridItem
    >
  </PGrid>
</template>
```

## Grid with overlaying cells

Grid component with cells that overlay another in various states.

```vue demo
<template>
  <PGrid class="min-h-50" columns="12" rows="3" debug>
    <PGridItem column="1/3" row="1/3">
      1
    </PGridItem>

    <PGridItem column="2/4" row="2/4">
      2
    </PGridItem>

    <PGridItem column="3/10" row="2/4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at felis
    </PGridItem>

    <PGridItem column="7/12" row="1/2">
      3
    </PGridItem>

    <PGridItem column="11/13" row="1/3">
      4
    </PGridItem>
  </PGrid>
</template>
```

## Specific Grid with Guide Clipping

Grid component with guide clipping enabled on specific cells.

```vue demo
<template>
  <PGrid class="min-h-50" columns="3" rows="4" debug>
    <PGridItem column="1/2" row="1/3"> 1 </PGridItem>
    <PGridItem column="3/4" row="1/2"> 2 </PGridItem>
    <PGridItem column="2/3" row="2/4"> 3 </PGridItem>
    <PGridItem column="1/2" row="4/5"> 4 </PGridItem>
    <PGridItem column="3/4" row="3/5"> 5 </PGridItem>
  </PGrid>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| debug | `boolean` | - | - |
| rows | `strin \| Responsive \| number>` | - | - |
| columns | `strin \| Responsive \| number>` | - | - |

## GridItem Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| row | `ResponsiveValue<string \| number>` | - | - |
| column | `ResponsiveValue<string \| number>` | - | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

## GridItem Slots

| Name | Description |
| --- | --- |
| default | Default slot |
