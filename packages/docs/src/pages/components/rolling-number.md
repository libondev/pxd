# Rolling Number

Display a number with a rolling animation effect, supporting decimals and thousands separators.

## Default

```vue demo
<template>
  <PRollingNumber :value="999" />
</template>
```

## Thousands

```vue demo
<template>
  <PRollingNumber :value="1000" thousands />
</template>
```

## Durations

```vue demo
<template>
  <PRollingNumber :value="999" :durations="5000" />
</template>
```

## With suffix

```vue demo
<template>
  <PRollingNumber value="999+ Users" :durations="5000" />
</template>
```
