<script lang="ts" setup>
import type { PopoverEmits, PopoverProps } from './types'
import { computed, shallowRef } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useFocusTrap } from '../../composables/_internal/use-focus-trap.js'
import { usePopupEngine } from '../../composables/_internal/use-popup-engine.js'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../../composables/use-media-query.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isTruthyProp } from '../../utils/format.js'
import PPopoverArrow from '../_internal/popover-arrow.vue'
import POverlay from '../overlay/index.vue'

defineOptions({
  name: 'PPopover',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<PopoverProps>(), {
  trigger: () => ['hover'],
  position: 'bottom',
  layout: 'auto',
  matchWidth: false,
  keepHeight: false,
  showDelay: 0,
  hideDelay: 0,
  interactive: true,
  autoPosition: true,
  destroyDelay: 3000,
  toggleOnTrigger: true,
  closeOnInvisible: true,
  autoFocusElement: false,
  closeOnPressEscape: true,
  closeOnOutsideClick: true,
  returnFocusOnDeactivate: true,
  agent: true,
})

const emits = defineEmits<PopoverEmits>()

const arrowRef = shallowRef<HTMLElement>(null!)
const triggerRef = shallowRef<HTMLElement>(null!)
const wrapperRef = shallowRef<HTMLElement>(null!)
const containerRef = shallowRef<HTMLElement>(null!)
const overlayZIndex = computed(() => {
  if (props.zIndex === undefined || props.zIndex === '') {
    return undefined
  }

  const value = Number(props.zIndex)

  return Number.isFinite(value) ? value : undefined
})

const isSmallScreen = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)

// `auto` anchors the panel next to its trigger on wide screens and hands it to a bottom sheet on
// narrow ones, so no caller has to read the breakpoint or carry the sheet classes itself.
const layoutMode = computed(() =>
  props.layout === 'auto' ? (isSmallScreen.value ? 'sheet' : 'anchored') : props.layout,
)
const isSheet = computed(() => layoutMode.value === 'sheet')

const configProvider = useConfigProvider()

const engine = usePopupEngine({
  modelValue: () => props.modelValue,
  trigger: () => props.trigger,
  triggerSelector: () => props.triggerSelector,
  alignPoint: () => props.alignPoint,
  disabled: () => props.disabled,
  sheet: isSheet,
  maxWidth: () => props.maxWidth,
  maxHeight: () => props.maxHeight,
  position: () => props.position,
  showDelay: () => props.showDelay,
  hideDelay: () => props.hideDelay,
  showArrow: () => props.showArrow,
  arrowColor: () => props.arrowColor,
  interactive: () => props.interactive,
  autoPosition: () => props.autoPosition,
  destroyDelay: () => props.destroyDelay,
  contentRole: () => props.contentRole,
  toggleOnTrigger: () => props.toggleOnTrigger,
  autoFocusElement: () => props.autoFocusElement,
  matchReferenceWidth: () => props.matchWidth,
  stableHeight: () => props.keepHeight,
  closeOnInvisible: () => props.closeOnInvisible,
  closeOnOutsideClick: () => props.closeOnOutsideClick,
  zIndex: () => props.zIndex,
  triggerRef,
  wrapperRef,
  containerRef,
  arrowRef,
  onVisibleChange: (visible) => emits('visible-change', visible),
  onShow: () => emits('show'),
  onHide: () => emits('hide'),
  onUpdateModelValue: (visible) => emits('update:model-value', visible),
  onEscape: (ev) => emits('escape', ev),
  onOutsideClick: (ev) => emits('outside-click', ev),
  onTriggerClick: (ev) => emits('trigger-click', ev),
  onWrapperKeydown: (ev) => emits('wrapper-keydown', ev),
})

useFocusTrap(engine.focusTrapContainer, () => {
  const options = {
    autoFocusElement: props.autoFocusElement,
    returnFocusOnDeactivate: props.returnFocusOnDeactivate,
  }

  return isTruthyProp(props.autoFocusElement) ? options : { ...options, initialFocus: false }
})

if (props.agent) {
  useAgentNode({
    name: 'popover',
    namedBy: 'button',
    state: () => ({ open: engine.isVisible.value }),
    actions: {
      setOpen: async (open) => {
        await (open ? engine.handlePopoverShow() : engine.handlePopoverHide())
      },
      toggle: async () => {
        await (engine.isVisible.value ? engine.handlePopoverHide() : engine.handlePopoverShow())
      },
    },
  })
}

defineExpose({
  show: engine.handlePopoverShow,
  hide: engine.handlePopoverHide,
  update: engine.throttledUpdatePosition,
})
</script>

<template>
  <div
    data-popover
    ref="triggerRef"
    class="pxd-popover inline-flex max-w-full touch-manipulation active:select-none data-[disabled=true]:pointer-events-none data-[visible=true]:pointer-events-auto"
    :data-visible="engine.isVisible.value"
    :data-disabled="disabled"
    v-bind="$attrs"
    @click.capture="engine.onTriggerClick"
    @contextmenu="engine.onTriggerContextmenu"
    @focusin.capture="engine.onTriggerFocusIn"
    @focusout.capture="engine.onTriggerFocusOut"
    @pointerover="engine.onTriggerPointerOver"
    @pointerout="engine.onTriggerPointerOut"
    @pointermove="engine.onTriggerPointerMove"
  >
    <slot />

    <POverlay
      v-if="engine.isRender.value"
      :model-value="engine.isRevealed.value"
      :z-index="overlayZIndex"
      :variant="isSheet ? 'default' : 'none'"
      :close-on-press-escape="closeOnPressEscape"
      :lock-scroll-on-visible="isSheet"
      @escape="engine.handlePopoverEscape"
    >
      <div
        ref="wrapperRef"
        tabindex="-1"
        :id="engine.contentId"
        :role="contentRole || 'dialog'"
        :aria-modal="contentRole ? undefined : 'true'"
        :data-visible="engine.isRevealed.value"
        :data-layout="layoutMode"
        :data-position="engine.localPosition.value"
        :data-interactive="interactive"
        :class="wrapperClass"
        :style="engine.wrapperStyle.value"
        :aria-labelledby="ariaLabelledby"
        class="pxd-popover--wrapper sm:max-w-(--popover-max-width) fixed isolate z-(--popover-index) flex max-w-full will-change-transform outline-none data-[interactive=false]:pointer-events-none data-[visible=false]:pointer-events-none data-[visible=false]:transition-none! motion-reduce:data-[visible=false]:invisible"
        @keydown="engine.onWrapperKeydown"
        @pointerenter="engine.onWrapperPointerEnter"
        @pointerleave="engine.onWrapperPointerLeave"
      >
        <div
          ref="containerRef"
          class="pxd-popover--container pointer-events-none relative z-1 min-h-inherit w-full max-w-inherit default-transition-duration default-transition-timing-function"
          :data-transition-type="isSheet ? 'fade-slide' : 'fade-scale'"
          :data-enter-motion="configProvider.enterMotion"
          :data-leave-motion="configProvider.leaveMotion"
        >
          <div
            class="pxd-popover--content h-full max-h-inherit max-w-inherit overflow-auto"
            :class="contentClass"
          >
            <slot
              name="content"
              :active-trigger="engine.activeTriggerRef.value"
              :active-trigger-index="engine.activeTriggerIndex.value"
            />
          </div>

          <div
            v-if="showArrow"
            ref="arrowRef"
            class="pxd-popover--arrow pointer-events-none absolute z-1"
          >
            <PPopoverArrow
              fill="var(--popover-arrow-color,transparent)"
              stroke="var(--popover-arrow-border,transparent)"
              :position="engine.localPosition.value"
            />
          </div>
        </div>
      </div>
    </POverlay>
  </div>
</template>

<style lang="postcss">
.pxd-popover--wrapper {
  --popover-padding: calc(var(--popover-offset, 8) * 0.0625rem);
  --popover-origin: center;

  /* One ceiling for the panel: whatever space the engine leaves it, kept under the design limit. */
  &[data-layout='anchored'] {
    max-height: min(var(--popover-available-height, 100dvh), var(--popover-max-height));
  }

  /* The sheet fills the viewport, sits on its bottom edge and hands its own ceiling to the panel. */
  &[data-layout='sheet'] {
    width: 100%;
    height: 100%;
    align-items: flex-end;
    pointer-events: none;
    max-height: 100dvh;

    .pxd-popover--container {
      max-height: var(--popover-max-height);
    }

    .pxd-popover--content {
      width: 100%;
      border-radius: 0.75rem 0.75rem 0 0;
    }
  }

  &[data-position='top'] {
    --popover-origin: center bottom;
  }

  &[data-position='top-start'] {
    --popover-origin: left bottom;
  }

  &[data-position='top-end'] {
    --popover-origin: right bottom;
  }

  &[data-position='bottom'] {
    --popover-origin: center top;
  }

  &[data-position='bottom-start'] {
    --popover-origin: left top;
  }

  &[data-position='bottom-end'] {
    --popover-origin: right top;
  }

  &[data-position='left'] {
    --popover-origin: right center;
  }

  &[data-position='left-start'] {
    --popover-origin: right top;
  }

  &[data-position='left-end'] {
    --popover-origin: right bottom;
  }

  &[data-position='right'] {
    --popover-origin: left center;
  }

  &[data-position='right-start'] {
    --popover-origin: left top;
  }

  &[data-position='right-end'] {
    --popover-origin: left bottom;
  }

  &[data-position^='top'] {
    &[data-layout='anchored'] {
      padding-bottom: var(--popover-padding);
    }

    .pxd-popover--arrow {
      bottom: -6px;
    }
  }

  &[data-position^='bottom'] {
    &[data-layout='anchored'] {
      padding-top: var(--popover-padding);
    }

    .pxd-popover--arrow {
      top: -6px;
    }
  }

  &[data-position^='left'] {
    &[data-layout='anchored'] {
      padding-right: var(--popover-padding);
    }

    .pxd-popover--arrow {
      right: -6px;
    }
  }

  &[data-position^='right'] {
    &[data-layout='anchored'] {
      padding-left: var(--popover-padding);
    }

    .pxd-popover--arrow {
      left: -6px;
    }
  }

  .pxd-popover--content:has(> [data-list]) {
    display: flex;
    flex-direction: column;
  }

  .pxd-popover--content.variant-inverted + .pxd-popover--arrow {
    --popover-arrow-border: var(--color-gray-300);
  }

  .pxd-popover--container {
    transition-property: opacity, transform;
    transform-origin: var(--popover-origin);
  }

  &[data-visible='true'] .pxd-popover--container {
    opacity: 1;
    pointer-events: auto;
  }

  &[data-visible='false'] .pxd-popover--container[data-transition-type='fade-scale'] {
    opacity: 0;
    transform: scale(var(--popover-scale));
  }

  &[data-visible='false'] .pxd-popover--container[data-transition-type='fade-slide'] {
    transform: translateY(100%);
  }
}
</style>
