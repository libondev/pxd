# Composables Roadmap

Snapshot of the composable refactor after Phase 0-3. Re-derive the numbers with the audit command
in `.agents/guides/composables.md`; the tiers below are a judgement call, not a mechanical rule.

## Tiers

| Tier | Definition | Count |
| --- | --- | --- |
| **A. Behavior-first** | The headless behavior is the product; the template is a thin render layer | 9 |
| **B. Interactive** | State machine plus DOM, pointer, layout or accessibility protocol | 63 |
| **C. Presentation** | Logic is derived styles, formatting or animation; no shareable state machine | 59 |

### A. Behavior-first

`copy-button`, `countdown`, `hold-button`, `intersection-observer`, `loading-bar`, `message`, `stick-to-bottom`, `theme-switcher`, `virtual-list`

An A component is only worth extracting when the four questions in
`.agents/guides/composables.md` pass. Current state:

| Component | Core | Decision |
| --- | --- | --- |
| `countdown` | `useCountdown` (public) | done; props/emits decoupled |
| `virtual-list` | `useVirtualList` (public) | done |
| `message` | `useMessage` + `useMessageGroup` | done |
| `copy-button` | `useCopyClick` (public) | done |
| `stick-to-bottom` | `useStickToBottom` (public) | done |
| `theme-switcher` | `useColorScheme` (public) | done |
| `intersection-observer` | `useIntersectionObserver` (public) | done |
| `hold-button` | `useHold` (public) | done; pointer capture and the inside-rect check stay in the component |
| `loading-bar` | inline ticker + public event emitter | deferred: the rAF timestamp leaks into the increase amount (see below) |

### B. Interactive

`active-graph`, `approval-card`, `backtop`, `bubble-group`, `calendar`, `carousel`, `checkbox`, `checkbox-group`, `choicebox`, `choicebox-item`, `code-block`, `collapse`, `collapse-group`, `color-selector`, `command-menu`, `confirm-popover`, `date-picker`, `drawer`, `effort-slider`, `ellipsis-text`, `fader`, `hint`, `image-preview`, `input`, `list`, `list-item`, `loading-mask`, `mention`, `menu`, `modal`, `more-button`, `number-input`, `overlay`, `page-number`, `pagination`, `pin-input`, `popover`, `questionnaire`, `radio`, `radio-group`, `rating`, `reasoning`, `resizable`, `scroll-progress`, `scrollable`, `select`, `slider`, `split-button`, `steps`, `swipe-cell`, `switch`, `switch-item`, `tabs`, `textarea`, `time-picker`, `toc`, `todo-list`, `toggle`, `toggle-button`, `toggle-button-group`, `tool-call`, `tour`, `tree`

Shared seams that already exist: `useModelValue` (controlled/uncontrolled), `useListNavigation` /
`useListKeyboardController` / `useListSearch` / `useListSelection` (list-like controls), `useVirtualList`
(tree, list, bubble-group), `usePopoverResponsive` (select, date-picker, time-picker, mention,
confirm-popover, menu), `useOverlayDialog` (modal, drawer), `useFocusTrap`, `useSwipeGesture`
(carousel, swipe-cell), `useTourTarget`, `useScrollspy`, `useResizeObserver` / `useMutationObserver`.

The only remaining props-coupled internal is `_internal/use-popup-engine.ts` (popover, tooltip and
everything built on them). It is the highest-risk extraction left and should ship with the popover
tests, not as a drive-by change.

### C. Presentation

`avatar`, `avatar-group`, `badge`, `book`, `border-beam`, `breadcrumb`, `breadcrumb-item`, `browser`, `bubble`, `button`, `button-group`, `card`, `checkerboard`, `chip`, `config-provider`, `context-usage`, `dash-line`, `description`, `empty-state`, `error`, `feedback-bar`, `gauge`, `grid`, `grid-item`, `hue-text`, `kbd`, `label`, `link-button`, `list-group`, `loading-dots`, `marching-ants`, `marquee`, `material`, `message-item`, `noise-background`, `note`, `placeholder`, `progress`, `project-banner`, `radial-burst`, `reactions`, `reveal`, `rolling-number`, `scalable-text`, `scroll-text`, `search-input`, `separator`, `shimmer-text`, `skeleton`, `snippet`, `spinner`, `spinner-dots`, `stack`, `status-dot`, `text`, `time-ago`, `timeline`, `timeline-item`, `tooltip`

No composables. These are the components the convention explicitly excludes: extracting their
`computed` styles or animation parameters would produce shallow, single-consumer modules.

## Priority queue

Done: `useCarousel`, `useHold`, `useListSelection`, `useOverlayDialog`, the `ButtonVariant`
move to `src/types/components` and the slider geometry utils.

Deferred, in order:

1. **`use-popup-engine`** - drop the `props` / `emits` parameters for explicit `MaybeRefOrGetter`
   inputs and `onXxx` callbacks. It has one consumer, 23 prop reads and eight emits, so the change
   is mechanical but wide; it should ship alone with the popover suite as the safety net.
2. **`useLoadingBar`** - move the trickle/ticker state machine out of the component. Blocked on a
   deliberate fix first: `raf(increaseProgress)` hands the animation timestamp to `n`, so
   `const amount = n || getIncreaseDelta(...)` jumps the bar to the cap instead of trickling.
   Fix that with a test, then extract.

## Explicitly not doing

- **`resizable`** - the fold threshold, pointer dead zone, captured pointer, container measurement
  and aria range are interlocked. A `useResizable` would need `elementRef`, pointer ids, measured
  sizes and fold state as inputs, i.e. a large interface with one consumer. It stays component-local.
- **C-tier components** - `border-beam`, `marching-ants`, `rolling-number`, `book`, `spinner`,
  `skeleton` and friends keep their logic in the SFC.
- **The rest of tier B** - `tabs` overflow measurement, `image-preview` zoom/pan transforms and
  `slider` pointer capture are DOM protocols, not domain state.

## Rules that came out of this pass

- A composable takes domain values (`MaybeRefOrGetter`) and reports through `onXxx`; it never takes
  a component's `props` object or `emits`.
- Animation is an injected `transition` callback (`useCarousel` is the reference): the composable
  owns the state machine, the component owns the DOM.
- Shared geometry lives in `src/utils/_internal/*`; shared state lives in composables.
- No re-exports. Import a shared type from its defining module.
