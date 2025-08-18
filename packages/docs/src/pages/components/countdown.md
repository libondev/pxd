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

## Invert
Setting the `invert` property can be converted into positive timing, and the `durations` passed in is the end time. If it is not set, it will not stop automatically.

```vue demo
<script setup>
import { ref } from 'vue'

const active1 = ref(false)
const active2 = ref(false)

function resetStatus() {
  active1.value = false
}

function onChange(s) {
  if (s) {
    active2.value = true
  }
}
</script>

<template>
  <PStack direction="vertical">
    <PToggle v-model="active1" label="Active" @change="onChange" />

    <PCountdown
      invert
      :active="active1"
      :durations="5000"
      @finish="resetStatus"
    />

    <!-- timers without durations will not stop voluntarily -->
    <PCountdown
      invert
      :active="active2"
    />
  </PStack>
</template>
```

## StartAt
Specifies when to start, and is often used to resume timing from an interrupted timer.

```vue demo
<script setup>
import { ref } from 'vue'

const active = ref(false)

function resetStatus() {
  active.value = false
}
</script>

<template>
  <PStack direction="vertical">
    <PToggle v-model="active" label="Active" />

    <PCountdown
      :active="active"
      :startAt="5000"
      format="HH:mm:ss.SSS"
      :durations="10000"
      @finish="resetStatus"
    />

    <PCountdown
      invert
      :active="active"
      :startAt="5000"
      format="HH:mm:ss.SSS"
      :durations="10000"
      @finish="resetStatus"
    />
  </PStack>
</template>
```

## Customize

```vue demo
<script setup>
import PlayCircleIcon from '@gdsicon/vue/play-circle'
import PauseCircleIcon from '@gdsicon/vue/pause-circle'

import { ref } from 'vue'

const active = ref(false)
</script>

<template>
  <div class="h-16">
    <PCountdown :active="active" :durations="5000" @finish="active = false">
      <template #default="{times}">
        <PButton variant="primary" @click="active = !active">
          <template #prefix>
            <Component :is="active ? PauseCircleIcon : PlayCircleIcon" />
          </template>

          {{ active ? 'Stop' : 'Start' }}
        </PButton>

        <div
          class="absolute bg-red-200 left-0 top-0 flex gap-1.5 items-center justify-center pt-1 text-sm px-2 w-full h-full rounded-bl-lg rounded-br-lg transition-all opacity-0 -z-1"
          :class="{ 'translate-y-[90%] opacity-100': active }"
        >
          <i class="size-2 rounded-full bg-red-800" />
          {{ times.mm }}:{{ times.ss }}
        </div>
      </template>
    </PCountdown>
  </div>
</template>
```
