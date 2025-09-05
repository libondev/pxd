# Modal
Display popup content that requires attention or provides additional information.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal
    v-model="isVisible"
    title="Create Token"
    subtitle="Enter a unique name for your token to differentiate it from other tokens and then select the scope."
    @outside-click="handleClose"
  >
    <PText> Some content contained within the modal. </PText>

    <template #footer>
      <PButton @click="handleClose">
        Cancel
      </PButton>

      <PButton variant="primary" @click="handleClose">
        Submit
      </PButton>
    </template>
  </PModal>
</template>
```

## Loading

When `pending=true` is set, modal cannot be closed temporarily.

```vue demo
<script setup>
import { ref } from 'vue'

const isLoading = ref(false)
const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isLoading.value = true

  setTimeout(() => {
    isLoading.value = false
    isVisible.value = false
  }, 2000)
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal
    v-model="isVisible"
    title="Async Logic"
    :loading="isLoading"
    close-on-press-escape
    close-on-click-overlay
  >
    <PText>Content of the modal.</PText>

    <template #footer>
      <PButton block :loading="isLoading" @click="handleClose">
        Close (after two seconds)
      </PButton>
    </template>
  </PModal>
</template>
```

## Sticky

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal
    v-model="isVisible"
    header-stylize
    title="Create Token"
    @outside-click="handleClose"
  >
    <PText>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?
    </PText>

    <template #footer>
      <PButton @click="handleClose">
        Cancel
      </PButton>

      <PButton variant="primary" @click="handleClose">
        Submit
      </PButton>
    </template>
  </PModal>
</template>
```

## Close on click overlay
After setting the `close-on-click-overlay` attribute, clicking on the mask will close modal.

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal
    v-model="isVisible"
    title="Create Token"
    close-on-click-overlay
  >
    <PText> Some content contained within the modal. </PText>

    <template #footer>
      <PButton block @click="handleClose">
        Cancel
      </PButton>
    </template>
  </PModal>
</template>
```

## Close on press escape

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal
    v-model="isVisible"
    title="Create Token"
    close-on-press-escape
  >
    <PText> Some content contained within the modal. </PText>

    <template #footer>
      <PButton block @click="handleClose">
        Cancel
      </PButton>
    </template>
  </PModal>
</template>
```
