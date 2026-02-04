# Dash Line

Use controllable forms to create beautiful solid or dotted lines.

## Default

```vue demo
<template>
  <PDashLine />
</template>
```

## Position

```vue demo
<template>
  <div class="w-full h-10 flex flex-col">
    <PDashLine position="top" />

    <PDashLine :position="['left', 'right']" class="flex-1" />

    <PDashLine position="bottom" />
  </div>
</template>
```

## Dash and Gap

```vue demo
<template>
  <PStack class="w-full h-10">
    <PDashLine dash-size="10" gap="5" />

    <PDashLine dash-size="5" gap="20" />
  </PStack>
</template>
```

## Color

```vue demo
<template>
  <PStack class="w-full h-10">
    <PDashLine color="var(--color-red-600)" />

    <PDashLine color="var(--color-blue-600)" />

    <PDashLine color="var(--color-gray-500)" />
  </PStack>
</template>
```
