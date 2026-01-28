# Link Button
Inherit button style links.

## Default

LinkButton extends the [Button component](/components/button){class="font-medium underline"}.

```vue demo
<template>
  <PStack>
    <PLinkButton href="javascript:;" text="text prop button" />
    <PLinkButton href="javascript:;">
      slot button
    </PLinkButton>
  </PStack>
</template>
```

## Text Link
Set `variant="text"` to convert it into a link in normal text form.

```vue demo
<template>
  <PStack>
    <PLinkButton href="javascript:;" text="text prop button" variant="link" />
  </PStack>
</template>
```
