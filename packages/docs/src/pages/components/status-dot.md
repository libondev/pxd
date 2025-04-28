<script setup>

</script>

# StatusDot
Display an indicator of deployment status.

## Default

<PStack direction="col" class="px-2">
  <PStatusDot state="QUEUED" />
  <PStatusDot state="BUILDING" />
  <PStatusDot state="ERROR" />
  <PStatusDot state="READY" />
  <PStatusDot state="CANCELED" />
</PStack>

```html
<PStatusDot state="QUEUED" />
<PStatusDot state="BUILDING" />
<PStatusDot state="ERROR" />
<PStatusDot state="READY" />
<PStatusDot state="CANCELED" />
```

## Label
Set the `label` property to show the status text.

<PStack direction="col" class="px-2">
  <PStatusDot label state="QUEUED" />
  <PStatusDot label state="BUILDING" />
  <PStatusDot label state="ERROR" />
  <PStatusDot label state="READY" />
  <PStatusDot label state="CANCELED" />
</PStack>

```html
<PStatusDot label state="QUEUED" />
<PStatusDot label state="BUILDING" />
<PStatusDot label state="ERROR" />
<PStatusDot label state="READY" />
<PStatusDot label state="CANCELED" />
```

## Custom Label Text
Or pass a `string` to the `label` to customize the text.

<PStack direction="col" class="px-2">
  <PStatusDot label="QuEuEd" state="QUEUED" />
  <PStatusDot label="BuIlDiNg" state="BUILDING" />
  <PStatusDot label="ErRoR" state="ERROR" />
  <PStatusDot label="ReDaY" state="READY" />
  <PStatusDot label="CaNcElEd" state="CANCELED" />
</PStack>

```html
<PStatusDot label="QuEuEd" state="QUEUED" />
<PStatusDot label="BuIlDiNg" state="BUILDING" />
<PStatusDot label="ErRoR" state="ERROR" />
<PStatusDot label="ReDaY" state="READY" />
<PStatusDot label="CaNcElEd" state="CANCELED" />
```
