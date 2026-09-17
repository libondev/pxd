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

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` | - | Tool name shown in the header |
| status | `'pending' \| 'running' \| 'completed' \| 'error'` | `pending` | Status icon and badge |
| input | `unknown` | - | Request payload (objects are pretty-printed as JSON) |
| output | `unknown` | - | Response payload (objects are pretty-printed as JSON) |
