# Spinner

Indicate an action running in the background. Unlike the loading dots, this should generally be used to indicate loading feedback in response to a user action, like for buttons, pagination, etc.

## Default

```vue demo
<template>
  <PSpinner />
</template>
```

## Sizes

The size of `spinner` is determined by the `font-size`.

```vue demo
<template>
  <PSpinner class="text-4xl" />
</template>
```

## Colors

```vue demo
<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-4">
      <span class="w-24">Default:</span>
      <PSpinner />
    </div>
    <div class="flex items-center gap-4">
      <span class="w-24">Red:</span>
      <PSpinner class="text-red-700" />
    </div>
    <div class="flex items-center gap-4">
      <span class="w-24">Green:</span>
      <PSpinner class="text-green-700" />
    </div>
    <div class="flex items-center gap-4">
      <span class="w-24">Blue:</span>
      <PSpinner class="text-blue-700" />
    </div>
  </div>
</template>
```
