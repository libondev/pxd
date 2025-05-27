# Skeleton
Display a skeleton whilst another component is loading.

## Default with set width

```vue demo
<template>
  <PSkeleton width="160" />
</template>
```

## Default with box height

```vue demo
<template>
  <PSkeleton width="160" box-height="42" />
</template>
```

## Wrapping children
Setting the height to `auto` automatically calculates the height.

```vue demo
<template>
  <PStack gap="4" direction="col">
    <PSkeleton height="auto">
      <PButton>Hidden by skeleton</PButton>
    </PSkeleton>

    <PSkeleton :loading="false" height="auto">
      <PButton>Not hidden by skeleton</PButton>
    </PSkeleton>
  </PStack>
</template>
```

## Wrapping children with fixed size
The skeleton will hide when children are not null, but the size is retained.

```vue demo
<template>
  <PStack gap="4" direction="col">
    <PSkeleton height="100" width="100%" />

    <PSkeleton :loading="false" height="100" width="100%">
      <PButton>Not hidden by skeleton</PButton>
    </PSkeleton>
  </PStack>
</template>
```

## Shapes

```vue demo
<template>
  <PStack gap="4" direction="col">
    <PSkeleton shape="default" width="48" />

    <PSkeleton shape="rounded" width="48" />

    <PSkeleton shape="squared" width="48" />

    <PSkeleton shape="default" width="48" height="48" />

    <PSkeleton shape="rounded" width="48" height="48" />

    <PSkeleton shape="squared" width="48" height="48" />
  </PStack>
</template>
```

## No animation

```vue demo
<template>
  <PStack gap="4" direction="col">
    <PSkeleton height="100" width="100%" :animated="false" />
  </PStack>
</template>
```
