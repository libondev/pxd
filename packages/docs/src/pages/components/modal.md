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
    @click-outside="handleClose"
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
    title="Create Token"
    header-style
    @click-outside="handleClose"
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

## Single button

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
    header-style
    @click-outside="handleClose"
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
