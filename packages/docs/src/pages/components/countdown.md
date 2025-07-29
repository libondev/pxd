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
      @reset="resetStatus"
      @finish="resetStatus"
    />
  </PStack>
</template>
```

## Precision

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
      @reset="resetStatus"
      @finish="resetStatus"
    />

    <PCountdown
      :active="active"
      :precision="1"
      :durations="durations"
      @reset="resetStatus"
      @finish="resetStatus"
    />

    <PCountdown
      :active="active"
      :precision="2"
      :durations="durations"
      @reset="resetStatus"
      @finish="resetStatus"
    />

    <PCountdown
      :active="active"
      :precision="3"
      :durations="durations"
      @reset="resetStatus"
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

// One day later
const endTime = Date.now() + 86400001

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
      display="dd hh:mm:ss"
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

## Custom render
Passing in a target time will automatically calculate the remaining time.

```vue demo
<script setup>
import { shallowRef } from 'vue'

const active = shallowRef(false)

function resetStatus() {
  active.value = false
}
</script>

<template>
  <PStack direction="vertical">
    <PToggle v-model="active" label="Active" />

    <PCountdown
      :active="active"
      :durations="90000000"
      :precision="3"
      display="dd hh:mm:ss.ms"
      @finish="resetStatus"
    />
  </PStack>
</template>
```
