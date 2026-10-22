# Tool Call

Collapsible card for tool / function call traces with input and output payloads.

## Default

```vue demo
<template>
  <PToolCall
    name="search_flights"
    status="completed"
    :input="{
      origin: 'LHR',
      destination: 'SFO',
      date: '2026-06-14',
      cabin: 'economy',
    }"
    :output="{
      route: 'LHR -> SFO',
      bestOption: {
        airline: 'BA',
        priceUsd: 742,
        duration: '10h 45m',
        stops: 0,
      },
    }"
  />
</template>
```

## Status

```vue demo
<template>
  <PStack direction="vertical" class="gap-3">
    <PToolCall
      name="lookup_weather"
      status="pending"
      :input="{ city: 'San Francisco' }"
    />
    <PToolCall
      name="lookup_weather"
      status="running"
      :input="{ city: 'San Francisco' }"
    />
    <PToolCall
      name="lookup_weather"
      status="completed"
      :input="{ city: 'San Francisco' }"
      :output="{ tempC: 18, condition: 'fog' }"
    />
    <PToolCall
      name="lookup_weather"
      status="error"
      :input="{ city: 'San Francisco' }"
      :output="{ message: 'Upstream timeout' }"
    />
  </PStack>
</template>
```

## Latest expanded

`expand` follows the last call in the list: the new card opens, the older ones collapse. It is a command, not a binding — the card keeps toggling itself on click.

```vue demo
<template>
  <PStack direction="vertical" class="gap-3">
    <PButton @click="push">Run another call</PButton>

    <PToolCall
      v-for="(call, index) of calls"
      :key="call.id"
      :expand="index === calls.length - 1"
      :name="call.name"
      :input="call.input"
    />
  </PStack>
</template>

<script setup>
import { shallowRef } from 'vue'

const NAMES = ['search_flights', 'lookup_weather', 'get_forecast']
const calls = shallowRef([{ id: 1, name: NAMES[0], input: { origin: 'LHR' } }])

function push() {
  const id = calls.value.length + 1

  calls.value = [...calls.value, { id, name: NAMES[id % NAMES.length], input: { q: id } }]
}
</script>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` | - | Tool name shown in the header |
| status | `'pending' \| 'running' \| 'completed' \| 'error'` | `pending` | Status icon and badge |
| expand | `boolean` | `true` | Expanded state, applied whenever the value changes |
| input | `unknown` | - | Request payload (objects are pretty-printed as JSON) |
| output | `unknown` | - | Response payload (objects are pretty-printed as JSON) |
