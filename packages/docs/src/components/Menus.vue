<script lang="ts" setup>
interface Props {
  menus: any
}

defineProps<Props>()

const emits = defineEmits<{
  click: [MouseEvent]
}>()

function onLinkClick(event: MouseEvent) {
  emits('click', event)
}
</script>

<template>
  <ul>
    <li v-for="menu of menus" :key="menu.label" class="mb-0.5">
      <template v-if="'children' in menu">
        <ul>
          <p class="sm:text-sm my-1 px-0.5 text-[13px] text-foreground-secondary">
            {{ menu.group }}
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
