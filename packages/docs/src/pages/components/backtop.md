# Backtop

A button to back to top.

## Default

```vue demo
<template>
  <PText>Scroll down to see the bottom-right button.</PText>

  <PBacktop></PBacktop>
</template>
```

## Customizations

```vue demo
<template>
  <PText>Scroll down to see the bottom-right button.</PText>

  <PBacktop right="24" bottom="70" :visible-threshold="15">
    <PButton variant="primary">Back to top</PButton>
  </PBacktop>
</template>
```
