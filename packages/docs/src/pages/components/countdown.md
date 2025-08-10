# Countdown
Do something when you arrive at the appointed time.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const active = ref(false)
const durations = ref(5000)

function resetStatus() {
  active.value = false
}
</script>

<template>
  <PStack direction="vertical">
    <PToggle v-model="active" label="Active" />

    <PCountdown
      :active="active"
      :durations="durations"
      @finish="resetStatus"
    />
  </PStack>
</template>
```

## Format

```vue demo
<script setup>
import { ref } from 'vue'

const active = ref(false)
const durations = ref(86400000)

function resetStatus() {
  active.value = false
}
</script>

<template>
  <PStack direction="vertical">
    <PToggle v-model="active" label="Active" />

    <PCountdown
      :active="active"
      format="DD HH:mm:ss"
      :durations="durations"
      @finish="resetStatus"
    />

    <PCountdown
      :active="active"
      format="DD HH:mm:ss:S"
      :durations="durations"
      @finish="resetStatus"
    />

    <PCountdown
      :active="active"
      format="DD HH:mm:ss:SS"
      :durations="durations"
      @finish="resetStatus"
    />

    <PCountdown
      :active="active"
      format="DD HH:mm:ss:SSS"
      :durations="durations"
      @finish="resetStatus"
    />
  </PStack>
</template>
```

## Reset

```vue demo
<script setup>
import { shallowRef } from 'vue'

const active = shallowRef(false)
const countdownRef = shallowRef()

function reset() {
  countdownRef.value.reset()
}

function resetStatus() {
  active.value = false
}
</script>

<template>
  <PStack direction="vertical">
    <PToggle v-model="active" label="Active" />

    <PButton @click="reset">Reset</PButton>

    <PCountdown
      ref="countdownRef"
      :active="active"
      :durations="10000"
      @finish="resetStatus"
    />
  </PStack>
</template>
```

## EndTime
Passing in a target time will automatically calculate the remaining time.

```vue demo
<script setup>
import { shallowRef } from 'vue'

const active = shallowRef(false)

const endTime = Date.now() + 3600000 // 1 hour later

function resetStatus() {
  active.value = false
}
</script>

<template>
  <PStack direction="vertical">
    <PToggle v-model="active" label="Active" />

    <PCountdown
      :active="active"
      :endTime="endTime"
      @finish="resetStatus"
    />
  </PStack>
</template>
```

## Seconds timestamp
Passing in a target time will automatically calculate the remaining time.

```vue demo
<script setup>
import { shallowRef } from 'vue'

const active = shallowRef(false)

const currentTime = new Date()

const endTime = 3600 // 3600 seconds(1 hour)

function resetStatus() {
  active.value = false
}
</script>

<template>
  <PStack direction="vertical">
    <PToggle v-model="active" label="Active" />

    <PCountdown
      :active="active"
      :millisecond="false"
      :durations="endTime"
      @finish="resetStatus"
    />
  </PStack>
</template>
```
