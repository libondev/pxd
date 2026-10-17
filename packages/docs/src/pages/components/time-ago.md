# Time Ago

Render how long ago a timestamp, date string or `Date` object was, in the active locale.

## Default

```vue demo
<script setup>
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const now = Date.now()
</script>

<template>
  <PStack gap="2" direction="vertical">
    <PTimeAgo :value="now - 30 * SECOND" />
    <PTimeAgo :value="now - 5 * MINUTE" />
    <PTimeAgo :value="now - 3 * HOUR" />
    <PTimeAgo :value="now - 10 * DAY" />
  </PStack>
</template>
```

## Future

A value ahead of now is rendered in the opposite direction instead of being clamped.

```vue demo
<script setup>
const now = Date.now()
</script>

<template>
  <PTimeAgo :value="now + 3600000" />
</template>
```

## Without refresh

```vue demo
<script setup>
const start = Date.now() - 30 * 1000
</script>

<template>
  <PTimeAgo :value="start" :refresh="false" />
</template>
```

## Time Zone

Relative time is the difference between two absolute instants, so the component never converts zones. The only place a zone enters is parsing: a string without an offset (`'2026-10-14 10:00:00'`) is read in the reader's local zone, and so is `'2026-10-14'` — which `new Date()` reads as UTC midnight. Numbers and `Date` objects are already absolute and are used as they are.

The consequence falls on the data source: a UTC value sent without a `Z` or an offset is read as local time and lands one zone offset away. Emit an offset such as `'2026-10-14T02:00:00Z'` instead.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `string \| number \| Date` | - | Timestamp in milliseconds, date string or `Date` object to describe relative to now; an unparseable value renders the locale's invalid label |
| refresh | `boolean` | `true` | Update the text as time passes; `false` freezes it at the first render |
