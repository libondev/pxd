# Tabs
Display tab content.

Tabs are driven by the `options` prop; the tab bar and every panel are rendered by `PTabs` itself,
so the markup also exists in server-rendered HTML.

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('overview')

const options = [
  { label: 'Overview', value: 'overview' },
  { label: 'Account', value: 'account' },
  { disabled: true, label: 'Settings', value: 'settings' },
]
</script>

<template>
  <PTabs v-model="value" :options="options">
    <template #item="{ option }">
      This is {{ option.value }} tab content.
    </template>
  </PTabs>
</template>
```

## Label slot

Use the `label` slot when a trigger needs more than plain text. It receives the same
`{ option, active }` scope as the `item` slot.

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('inbox')

const options = [
  { label: 'Inbox', value: 'inbox' },
  { label: 'Archive', value: 'archive' },
]
</script>

<template>
  <PTabs v-model="value" :options="options">
    <template #label="{ option }">
      <PBadge>{{ option.label }}</PBadge>
    </template>

    <template #item="{ option }">
      {{ option.value }} content
    </template>
  </PTabs>
</template>
```

## Secondary

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('overview')

const options = [
  { label: 'Overview', value: 'overview' },
  { label: 'Account', value: 'account' },
  { disabled: true, label: 'Settings', value: 'settings' },
]
</script>

<template>
  <PTabs v-model="value" variant="secondary" :options="options">
    <template #item="{ option }">
      This is {{ option.value }} tab content.
    </template>
  </PTabs>
</template>
```

## Segmented

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('overview')

const options = [
  { label: 'Overview', value: 'overview' },
  { label: 'Account', value: 'account' },
  { disabled: true, label: 'Settings', value: 'settings' },
]
</script>

<template>
  <PTabs v-model="value" variant="segmented" :options="options">
    <template #item="{ option }">
      This is {{ option.value }} tab content.
    </template>
  </PTabs>
</template>
```

## Keep alive

Each panel is mounted the first time its tab becomes active and is then kept alive, so
switching tabs no longer discards the state inside it.

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('profile')
const profileName = ref('')
const securityCode = ref('')

const options = [
  { label: 'Profile', value: 'profile' },
  { label: 'Security', value: 'security' },
]
</script>

<template>
  <PTabs v-model="value" keep-alive :options="options">
    <template #item="{ option }">
      <PInput
        v-if="option.value === 'profile'"
        v-model="profileName"
        placeholder="Type in profile tab"
      />
      <PInput v-else v-model="securityCode" placeholder="Type in security tab" />
    </template>
  </PTabs>
</template>
```

## Uncontrolled

Without `v-model` the tabs keep their own state, and `default-value` picks the tab shown first.

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const profileName = ref('')

const options = [
  { label: 'Profile', value: 'profile' },
  { label: 'Security', value: 'security' },
]
</script>

<template>
  <PTabs default-value="profile" :options="options">
    <template #item="{ option }">
      <PInput
        v-if="option.value === 'profile'"
        v-model="profileName"
        placeholder="Type in profile tab"
      />
      <PInput v-else placeholder="This tab is discarded when you switch away." />
    </template>
  </PTabs>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `'default' \| 'secondary' \| 'segmented'` | `default` | Visual style of the tab bar |
| keep-alive | `boolean` | - | Mount every panel on its first activation and keep it alive afterwards, so its state survives switching |
| model-value | `string \| number` | - | Value of the active tab; binds the component in controlled mode |
| default-value | `string \| number` | - | Tab selected before the consumer binds `v-model` |
| options | `ComponentOption[]` | `[]` | Tabs to render; each entry is `{ label, value, disabled? }` and `value` must be unique |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| change | `string \| number` | Fired once when a tab becomes active through a click or a keyboard command |
| update:modelValue | `string \| number` | Fired together with `change` in controlled mode |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| item | `{ option, active }` | Content of the panel, rendered while the tab is active |
| label | `{ option, active }` | Replaces the `label` text of the tab trigger |
