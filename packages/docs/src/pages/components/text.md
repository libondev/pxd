# Text

Display text using well-defined typographic styles.

## Default

```vue demo
<template>
  <PStack direction="vertical">
    <PText :size="48">The Evil Rabbit jumps.</PText>
    <PText :size="32">The Evil Rabbit jumps.</PText>
    <PText :size="24">The Evil Rabbit jumps.</PText>
    <PText :size="20">The Evil Rabbit jumps.</PText>
    <PText :size="16">The Evil Rabbit jumps.</PText>
    <PText :size="14">The Evil Rabbit jumps.</PText>
    <PText :size="12">The Evil Rabbit jumps.</PText>
  </PStack>
</template>
```

## Responsive

```vue demo
<template>
  <PText :size="{ sm: 24, md: 32, lg: 48 }">The Evil Rabbit jumps.</PText>
</template>
```

## Secondary

```vue demo
<template>
  <PText secondary>The Evil Rabbit jumps.</PText>
</template>
```

## Align

```vue demo
<template>
  <PText align="left">The Evil Rabbit jumps.</PText>
  <PText align="center">The Evil Rabbit jumps.</PText>
  <PText align="right">The Evil Rabbit jumps.</PText>
</template>
```

## Monospace

```vue demo
<template>
  <PText>This is a sans-serif font.</PText>
  <PText monospace>This is a monospace font.</PText>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `string \| object` | `p` | - |
| text | `string` | - | - |
| size | `strin \| Responsive \| number>` | - | - |
| align | `'left' \| 'center' \| 'right'` | `left` | - |
| monospace | `boolean` | - | - |
| secondary | `boolean` | - | - |
