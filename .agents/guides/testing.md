# Testing

## Stack

- **Framework**: Vitest (via vite-plus)
- **Environment**: happy-dom (browser-like)
- **Pool**: vmThreads for performance

## Commands

- `pnpm test` — Run all tests (`vp test run`)
- `pnpm test:watch` — Watch mode (`vp test`)

## File Convention

- Test files: `**/*.test.ts`
- Location: `tests/` (mirrors `src/` structure)
- Example: `tests/components/button.test.ts` for `src/components/button/`

## Configuration

- Config is in `vite.config.ts` under `test:` block (no separate `vitest.config.ts`)
- TypeScript: `tsconfig.test.json` extends `tsconfig.app.json` with `vitest/happy-dom` types
- Typecheck: `vue-tsc -p tsconfig.app.json --noEmit`

## Writing Tests

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '~/components/my-component/index.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.exists()).toBe(true)
  })
})
```

## Rules

- Write tests for all critical paths
- Edge cases should be covered
- Use `describe`/`it` blocks for organization
- Mock external dependencies appropriately
- Test both Vue 2.7 and Vue 3 scenarios if necessary

## Checklist

- [ ] Test file in correct path under `tests/`
- [ ] Uses `vitest` imports
- [ ] Covers props, events, slots
- [ ] Covers edge cases (empty, null, extreme values)
- [ ] Mocks external dependencies
