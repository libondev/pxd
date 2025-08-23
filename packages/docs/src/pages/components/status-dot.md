# Status Dot
Display an indicator of deployment status.

## Default

```vue demo
<template>
  <PStack direction="vertical">
    <PStatusDot state="QUEUED" />
    <PStatusDot state="BUILDING" />
    <PStatusDot state="ERROR" />
    <PStatusDot state="READY" />
    <PStatusDot state="CANCELED" />
  </PStack>
</template>
```

## Label
Set the `label` property to show the status text.

```vue demo
<template>
  <PStack direction="vertical">
    <PStatusDot label state="QUEUED" />
    <PStatusDot label state="BUILDING" />
    <PStatusDot label state="ERROR" />
    <PStatusDot label state="READY" />
    <PStatusDot label state="CANCELED" />
  </PStack>
</template>
```

## Custom Label Text
Or pass a `string` to the `label` to customize the text.

```vue demo
<template>
  <PStack direction="vertical">
    <PStatusDot label="QuEuEd" state="QUEUED" />
    <PStatusDot label="BuIlDiNg" state="BUILDING" />
    <PStatusDot label="ErRoR" state="ERROR" />
    <PStatusDot label="ReDaY" state="READY" />
    <PStatusDot label="CaNcElEd" state="CANCELED" />
  </PStack>
</template>
```
