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

## Simple

`variant="simple"` drops the card background, border and trigger padding, so the call sits inline like `PReasoning`.

```vue demo
<template>
  <PToolCall
    variant="simple"
    name="search_flights"
    status="completed"
    :input="{ origin: 'LHR', destination: 'SFO' }"
    :output="{ route: 'LHR -> SFO', priceUsd: 742 }"
  />
</template>
```

## Text Output

Tool results are not always JSON. Plain strings render as-is, and content-block arrays (pi agent sdk / Anthropic style `content: [{ type: 'text', text }]`) are unwrapped to their text, with image blocks shown as `[image]` placeholders.

```vue demo
<template>
  <PStack direction="vertical" class="gap-3">
    <PToolCall
      name="bash"
      status="completed"
      :input="{ command: 'pnpm test', timeout: 30000 }"
      :output="[{ type: 'text', text: '$ pnpm test\n ✓ 8 tests passed\n Done in 2.14s' }]"
    />
    <PToolCall
      name="bash"
      status="error"
      :input="{ command: 'pnpm build' }"
      :output="'pnpm: command not found\nCommand exited with code 127'"
    />
  </PStack>
</template>
```

## Status

```vue demo
<template>
  <PStack direction="vertical" class="gap-3">
    <PToolCall name="lookup_weather" status="pending" :input="{ city: 'San Francisco' }" />
    <PToolCall name="lookup_weather" status="running" :input="{ city: 'San Francisco' }" />
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

| Name    | Type                                               | Default   | Description                                                                                                |
| ------- | -------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| name    | `string`                                           | -         | Tool name shown in the header                                                                              |
| variant | `'default' \| 'simple'`                            | `default` | `simple` drops the card background, border and trigger padding                                             |
| status  | `'pending' \| 'running' \| 'completed' \| 'error'` | `pending` | Status icon in the header                                                                                  |
| expand  | `boolean`                                          | `true`    | Expanded state, applied whenever the value changes                                                         |
| input   | `unknown`                                          | -         | Request payload (objects and JSON strings are pretty-printed as JSON, content-block arrays as plain text)  |
| output  | `unknown`                                          | -         | Response payload (objects and JSON strings are pretty-printed as JSON, content-block arrays as plain text) |
