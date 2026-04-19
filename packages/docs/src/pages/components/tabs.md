# Tabs
Display tab content.

## Default

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('overview')
</script>

<template>
  <PTabs v-model="value">
    <PTabsItem value="overview" label="Overview">
      This is overview tab content.
    </PTabsItem>

    <PTabsItem value="account">
      <template #label>Account</template>
      This is account tab content.
    </PTabsItem>

    <PTabsItem value="settings" label="Settings" disabled>
      This tab is disabled.
    </PTabsItem>
  </PTabs>
</template>
```

## Secondary

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('overview')
</script>

<template>
  <PTabs v-model="value" variant="secondary">
    <PTabsItem value="overview" label="Overview">
      This is overview tab content.
    </PTabsItem>

    <PTabsItem value="account">
      <template #label>Account</template>
      This is account tab content.
    </PTabsItem>

    <PTabsItem value="settings" label="Settings" disabled>
      This tab is disabled.
    </PTabsItem>
  </PTabs>
</template>
```

## Keep alive

Enabling `keep-alive` allows components to retain their internal states even when they are not active.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('profile')
const profileName = ref('')
const securityCode = ref('')
</script>

<template>
  <PTabs v-model="value" keep-alive>
    <PTabsItem value="profile" label="Profile">
      <PInput v-model="profileName" placeholder="Type in profile tab" />
    </PTabsItem>

    <PTabsItem value="security" label="Security">
      <PInput v-model="securityCode" placeholder="Type in security tab" />
    </PTabsItem>
  </PTabs>
</template>
```
