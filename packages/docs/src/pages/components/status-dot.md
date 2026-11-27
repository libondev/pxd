# Status Dot

Display an indicator of deployment status.

## Default

```vue demo
<template>
  <PStack direction="vertical">
    <PStatusDot status="QUEUED" />
    <PStatusDot status="BUILDING" />
    <PStatusDot status="ERROR" />
    <PStatusDot status="READY" />
    <PStatusDot status="CANCELED" />
  </PStack>
</template>
```

## Label

Set the `show-label` property to show the status text.

```vue demo
<template>
  <PStack direction="vertical">
    <PStatusDot show-label status="QUEUED" />
    <PStatusDot show-label status="BUILDING" />
    <PStatusDot show-label status="ERROR" />
    <PStatusDot show-label status="READY" />
    <PStatusDot show-label status="CANCELED" />
  </PStack>
</template>
```

## Custom Label Text

Or pass a `string` to the `label` prop to customize the text.

```vue demo
<template>
  <PStack direction="vertical">
    <PStatusDot label="QuEuEd" status="QUEUED" />
    <PStatusDot label="BuIlDiNg" status="BUILDING" />
    <PStatusDot label="ErRoR" status="ERROR" />
    <PStatusDot label="ReDaY" status="READY" />
    <PStatusDot label="CaNcElEd" status="CANCELED" />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string \| number \| null` | - | Custom text shown next to the dot |
| show-label | `boolean` | `false` | Show the capitalized `status` when no `label` is given |
| status | `'QUEUED' \| 'BUILDING' \| 'READY' \| 'ERROR' \| 'CANCELED'` | `QUEUED` | Deployment status driving the dot color and default label |
