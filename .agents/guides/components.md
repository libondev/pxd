# Component Development

## File Structure

```
src/components/{component-name}/
├── index.ts          # Export barrel
├── {name}.vue        # Main component
└── types.ts          # Types (optional)
```

## Template

```vue
<script setup lang="ts">
// Imports
// Props with defineProps
// Emits with defineEmits
// Logic
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Scoped styles */
</style>
```

## Rules (MUST follow)

- `<script setup lang="ts">` always
- Use `defineProps` and `defineEmits` (not `defineModel`)
- No top-level `await`
- No reactive Map/Set
- Export public types from `./types/shared`
- Events: kebab-case
- Curly braces: always required

## Vue 2.7 Compatibility

- ❌ Avoid: `defineModel`, top-level `await`, reactive arrays with Map/Set
- ✅ Use: `defineProps`, `defineEmits`, `ref`, `reactive`, `computed`

## After Creating a Component

1. Export from `src/components/index.ts`
2. Run `node scripts/update-exports.js` to update barrel exports, docs list, and `volar.d.ts`
3. Write tests in `tests/components/{name}.test.ts`

## Documentation Standards

- Use clear prop names
- Document events with kebab-case
- Provide JSDoc for TypeScript types
- Use consistent naming conventions
- Complex logic: explain "why" and "how" in English
- Avoid obvious comments (e.g., `i++ // increment i`)

## Checklist

- [ ] `<script setup lang="ts">`
- [ ] No `defineModel`, no top-level `await`
- [ ] Types exported to `types/shared`
- [ ] Events in kebab-case
- [ ] Exported from `src/components/index.ts`
- [ ] Tests written in `tests/components/`
- [ ] `volar.d.ts` updated
