# Note

## Default

```vue demo
<template>
  <PStack gap="2">
    <PNote size="sm"> A small note. </PNote>

    <PNote> A default note. </PNote>

    <PNote size="lg"> A large note. </PNote>
  </PStack>
</template>
```

## Action

```vue demo
<template>
  <PStack gap="2">
    <PNote>
      This note details some information.

      <template #action>
        <PButton variant="primary" size="sm"> Upgrade </PButton>
      </template>
    </PNote>

    <PNote>
      This note details a large amount information that could potentially wrap into two or more
      lines, forcing the height of the Note to be larger.

      <template #action>
        <PButton variant="primary" size="sm"> Upgrade </PButton>
      </template>
    </PNote>
  </PStack>
</template>
```

## Variants

```vue demo
<template>
  <PStack direction="col" gap="3">
    <PNote variant="default"> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="primary"> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="success"> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="error"> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="warning"> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="violet"> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="cyan"> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="default" fill> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="primary" fill> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="success" fill> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="error" fill> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="warning" fill> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="violet" fill> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>

    <PNote variant="cyan" fill> Lorem ipsum dolor sit amet consectetur adipisicing elit. </PNote>
  </PStack>
</template>
```

## Labels

```vue demo
<template>
  <PStack direction="col" gap="4">
    <b class="text-sm font-medium">Custom Label</b>

    <PNote label="Note">
      Lorem ipsum dolor sit amet consectetur adipisicing elit.
    </PNote>

    <PNote>
      <template #label>
        <b class="text-sm font-medium">Custom Label</b>
      </template>

      Lorem ipsum dolor sit amet consectetur adipisicing elit.
    </PNote>

    <b class="text-sm font-medium">No Label</b>
    <PNote :label="false">
      Lorem ipsum dolor sit amet consectetur adipisicing elit.
    </PNote>
  </PStack>
</template>
```
