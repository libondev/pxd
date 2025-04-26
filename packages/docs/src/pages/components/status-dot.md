# StatusDot
Display an indicator of deployment status.

## Basic

<div class="flex flex-col gap-4">
  <PStatusDot state="QUEUED" />
  <PStatusDot state="BUILDING" />
  <PStatusDot state="ERROR" />
  <PStatusDot state="READY" />
  <PStatusDot state="CANCELED" />
</div>

```html
<PStatusDot state="QUEUED" />
<PStatusDot state="BUILDING" />
<PStatusDot state="ERROR" />
<PStatusDot state="READY" />
<PStatusDot state="CANCELED" />
```

## Label
Set the `label` property to show the status text.

<div class="flex flex-col gap-4">
  <PStatusDot label state="QUEUED" />
  <PStatusDot label state="BUILDING" />
  <PStatusDot label state="ERROR" />
  <PStatusDot label state="READY" />
  <PStatusDot label state="CANCELED" />
</div>

```html
<PStatusDot label state="QUEUED" />
<PStatusDot label state="BUILDING" />
<PStatusDot label state="ERROR" />
<PStatusDot label state="READY" />
<PStatusDot label state="CANCELED" />
```

## Custom Label Text
Or pass a `string` to the `label` to customize the text.

<div class="flex flex-col gap-4">
  <PStatusDot label="QuEuEd" state="QUEUED" />
  <PStatusDot label="BuIlDiNg" state="BUILDING" />
  <PStatusDot label="ErRoR" state="ERROR" />
  <PStatusDot label="ReDaY" state="READY" />
  <PStatusDot label="CaNcElEd" state="CANCELED" />
</div>

```html
<PStatusDot label="QuEuEd" state="QUEUED" />
<PStatusDot label="BuIlDiNg" state="BUILDING" />
<PStatusDot label="ErRoR" state="ERROR" />
<PStatusDot label="ReDaY" state="READY" />
<PStatusDot label="CaNcElEd" state="CANCELED" />
```
