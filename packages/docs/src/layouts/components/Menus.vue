<script lang="ts" setup>
interface Props {
  menus: any
}

defineProps<Props>()

const emits = defineEmits<{
  'link-click': [MouseEvent]
}>()

function onLinkClick(event: MouseEvent) {
  emits('link-click', event)
}
</script>

<template>
  <ul>
    <li v-for="menu of menus" :key="menu.label" class="mb-0.5">
      <template v-if="'children' in menu">
        <ul>
          <p class="text-foreground-secondary text-sm mb-1 not-first:mt-1 px-0.5">
            {{ menu.label }}
          </p>

          <li v-for="child of menu.children" :key="child.path" class="mb-0.5">
            <PLinkButton variant="ghost" :href="child.path" block @click="onLinkClick">
              {{ child.label }}
            </PLinkButton>
          </li>
        </ul>
      </template>

      <template v-else>
        <PLinkButton variant="ghost" :href="menu.path" block @click="onLinkClick">
          {{ menu.label }}
        </PLinkButton>
      </template>
    </li>
  </ul>
</template>
