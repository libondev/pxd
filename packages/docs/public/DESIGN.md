---
version: alpha
name: PXD
description: A Vue 2.7 & 3.2 universal component library with built-in light/dark theme, PC & mobile ready, animation-free mode supported. Inspired by Vercel Geist Design System.
colors:
  primary: "#171717"
  primary-hover: "#3d3d3d"
  primary-active: "#0a0a0a"
  secondary: "#737373"
  accent-blue: "#0062d1"
  accent-red: "#da2f35"
  accent-amber: "#ff990a"
  accent-green: "#287a3a"
  accent-teal: "#05796e"
  accent-purple: "#7820bc"
  accent-pink: "#df2670"
  neutral: "#F5F5F4"
  surface: "#FFFFFF"
  surface-secondary: "#F7F7F5"
  border: "#00000014"
  border-hover: "#b9b9b9"
  border-active: "#a1a1a1"
  foreground: "#171717"
  foreground-secondary: "#737373"
typography:
  h1:
    fontFamily: "Inter, Inter Fallback, Geist, Arial, ui-sans-serif, system-ui, sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  h2:
    fontFamily: "Inter, Inter Fallback, Geist, Arial, ui-sans-serif, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  h3:
    fontFamily: "Inter, Inter Fallback, Geist, Arial, ui-sans-serif, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
  body-lg:
    fontFamily: "Inter, Inter Fallback, Geist, Arial, ui-sans-serif, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: "Inter, Inter Fallback, Geist, Arial, ui-sans-serif, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Inter, Inter Fallback, Geist, Arial, ui-sans-serif, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.6
  label-lg:
    fontFamily: "Inter, Inter Fallback, Geist, Arial, ui-sans-serif, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.4
  label-md:
    fontFamily: "Inter, Inter Fallback, Geist, Arial, ui-sans-serif, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
  label-sm:
    fontFamily: "Inter, Inter Fallback, Geist, Arial, ui-sans-serif, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
components:
  button-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: 36px
    padding: "10px"
  button-default-hover:
    backgroundColor: "#f0f0ef"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    height: 36px
    padding: "10px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
  button-error:
    backgroundColor: "{colors.accent-red}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    height: 36px
    padding: "10px"
  button-error-hover:
    backgroundColor: "#A63327"
  button-error-active:
    backgroundColor: "#8E1B15"
  button-warning:
    backgroundColor: "#ff990a"
    textColor: "#000000"
    rounded: "{rounded.md}"
    height: 36px
    padding: "10px"
  button-warning-hover:
    backgroundColor: "{colors.accent-amber}"
  button-warning-active:
    backgroundColor: "#6B2C0B"
  button-success:
    backgroundColor: "#287a3a"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    height: 36px
    padding: "10px"
  button-success-hover:
    backgroundColor: "{colors.accent-green}"
  button-success-active:
    backgroundColor: "#1D5724"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: 36px
    padding: "10px"
  input-hover:
    backgroundColor: "{colors.surface}"
  input-focus:
    backgroundColor: "{colors.surface}"
  input-error:
    backgroundColor: "{colors.surface}"
  link-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent-blue}"
  chip-teal:
    backgroundColor: "{colors.accent-teal}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
  chip-purple:
    backgroundColor: "{colors.accent-purple}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
  chip-pink:
    backgroundColor: "{colors.accent-pink}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
  description:
    textColor: "{colors.foreground-secondary}"
  card-elevated:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.lg}"
  border-default:
    backgroundColor: "{colors.border}"
  border-hover:
    backgroundColor: "{colors.border-hover}"
  border-active:
    backgroundColor: "{colors.border-active}"
  secondary-surface:
    backgroundColor: "{colors.surface-secondary}"
    rounded: "{rounded.md}"
  modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    width: 540px
  drawer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
  tooltip:
    backgroundColor: "#171717"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
  popover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  avatar:
    size: 32px
    rounded: "{rounded.full}"
---

# PXD Design System

## Overview

PXD is a **minimal, utility-first component library** for Vue 2.7 and Vue 3.2+, inspired by the Vercel Geist Design System. The design language emphasizes **clarity, restraint, and developer ergonomics**. It aims for a neutral, professional aesthetic where content takes precedence over chrome.

The visual personality is **monochrome-forward** with a near-black primary color (`#171717`) used for text and key actions. Color accents are reserved sparingly for semantic feedback: blue for interactive links, red for errors, amber for warnings, and green for success states. The overall feel is clean, modern, and functional -- suitable for dashboards, developer tools, documentation sites, and enterprise applications.

PXD supports **light and dark modes** out of the box, toggled via a `.dark` class on the root element. Both modes are first-class citizens with carefully calibrated palettes. All components respect `prefers-reduced-motion` and disable animations when the user requests it.

## Colors

The color system is built on **HSL custom properties** with a two-layer architecture: raw `*-value` variables for palette definition and resolved `--color-*` tokens for Tailwind integration.

The neutral palette (Gray 100--1000) forms the backbone of the UI, handling text, borders, backgrounds, and subtle interactive states. Semantic accent colors follow a consistent 10-step scale (100--1000) where lighter values serve as backgrounds and darker values provide text contrast.

- **Primary (`#171717`):** A near-black used for headlines, core text, and primary actions. Provides maximum readability and a sense of solidity.
- **Secondary (`#737373`):** A mid-gray for secondary text, captions, and metadata. Maintains hierarchy without competing with primary content.
- **Accent Blue (`#0062d1`):** Reserved for interactive elements -- links, focused inputs, and selected states.
- **Accent Red (`#da2f35`):** Error states, destructive actions, and critical alerts.
- **Accent Amber (`#ff990a`):** Warning states and cautionary feedback.
- **Accent Green (`#287a3a`):** Success states, positive confirmations, and online indicators.
- **Neutral (`#F5F5F4`):** A warm off-white for page backgrounds, providing softer contrast than pure white.

### Dark Mode

Dark mode inverts the palette while maintaining the same semantic roles. Backgrounds shift to near-black (`#0D0D0D` and `#000000`), while text becomes light (`#EDEDEC`). Gray Alpha values use white-based transparency in dark mode for overlays and subtle surfaces. All accent colors are recalibrated with lower lightness values for dark backgrounds to maintain WCAG contrast ratios.

### Semantic Color Tokens

| Token | Light Value | Dark Value | Usage |
|-------|------------|------------|-------|
| `primary` | `#171717` | `#EDEDEC` | Text, primary actions |
| `border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.13)` | Default borders |
| `border-hover` | `#b9b9b9` | `#5c5c5c` | Hovered borders |
| `foreground` | `#171717` | `#EDEDEC` | Body text |
| `foreground-secondary` | `#737373` | `#8f8f8f` | Secondary text |
| `background-100` | `#FFFFFF` | `#0D0D0D` | Primary surface |
| `background-200` | `#F7F7F5` | `#000000` | Secondary surface |
| `background-hover` | `#F0F0EF` | `#1C1C1C` | Hovered surfaces |
| `background-active` | `#E5E5E3` | `#2B2B2B` | Active surfaces |
| `accent-blue` | `#0062d1` | `#3E94FF` | Links, focus states |
| `accent-red` | `#da2f35` | `#da2f35` | Error, destructive |
| `accent-amber` | `#ff990a` | `#ff990a` | Warning, caution |
| `accent-green` | `#398e4a` | `#398e4a` | Success, positive |

## Typography

The type system uses **Inter** as the primary font family, with Geist as the preferred alternative and Arial as the system fallback. Font rendering is optimized with antialiased smoothing, ligatures disabled, and `optimizeLegibility` enabled.

The scale uses both standard Tailwind sizes and custom pixel-based tokens (`--text-13` at 13px and `--text-15` at 15px) to achieve precise typographic rhythm. All text inherits the font stack globally -- there is no need to apply font classes to individual elements.

- **Headlines (h1--h3):** Set in Inter Semi-Bold (600) with tight letter-spacing for a crisp, editorial feel. Used sparingly for page titles and section headings.
- **Body text:** Inter Regular (400) at 15px with generous 1.6 line-height for comfortable reading in long-form content.
- **Labels and UI text:** Inter Medium (500) at 13px for buttons, form labels, and navigation items. Tighter line-height (1.4) for compact UI density.
- **Captions:** Inter Regular at 11--12px for timestamps, metadata, and helper text.

### Typography Tokens

| Token | Font | Size | Weight | Line Height | Letter Spacing | Role |
|-------|------|------|--------|-------------|----------------|------|
| `h1` | Inter | 30px | 600 | 1.2 | -0.02em | Page titles |
| `h2` | Inter | 24px | 600 | 1.3 | -0.01em | Section headings |
| `h3` | Inter | 20px | 600 | 1.4 | normal | Subsection headings |
| `body-lg` | Inter | 16px | 400 | 1.6 | normal | Long-form content |
| `body-md` | Inter | 15px | 400 | 1.6 | normal | Default body text |
| `body-sm` | Inter | 13px | 400 | 1.6 | normal | Compact body text |
| `label-lg` | Inter | 15px | 500 | 1.4 | normal | Large labels |
| `label-md` | Inter | 13px | 500 | 1.4 | normal | Default labels |
| `label-sm` | Inter | 11px | 500 | 1.4 | normal | Small labels |

## Layout

PXD follows a **content-first layout model** without imposing a rigid grid. Components are designed to flow naturally within their containers using CSS flexbox and grid utilities from Tailwind.

The spacing system uses a **4px base unit** with named scales: `xs` (4px), `sm` (8px), `md` (16px), `lg` (32px), and `xl` (64px). Component padding and margins follow these scales consistently. Internal component spacing typically uses 8px or 10px for compact density.

The default border radius is **8px** (`--radius: 0.5rem`), with derived scales for different contexts. Container widths are not fixed -- components adapt responsively. The only fixed-width component is the Modal at 540px (`--modal-width: 33.75rem`).

### Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Micro spacing, icon gaps |
| `sm` | 8px | Tight padding, compact lists |
| `md` | 16px | Standard padding, section gaps |
| `lg` | 32px | Section separators |
| `xl` | 64px | Page-level spacing |

## Elevation & Depth

Depth is conveyed through **layered shadows** rather than heavy borders. The system defines seven shadow tiers, each calibrated for a specific UI layer:

| Shadow | Usage |
|--------|-------|
| `shadow-small` | Subtle lift for cards and chips |
| `shadow-medium` | Dropdown menus, elevated cards |
| `shadow-large` | Popovers, tooltips |
| `shadow-tooltip` | Tooltip overlays |
| `shadow-menu` | Context menus, command palettes |
| `shadow-modal` | Modal dialogs |
| `shadow-fullscreen` | Full-screen overlays |

Each shadow tier has a "border" variant that combines the shadow with a subtle 1px border (`rgba(0,0,0,0.08)` in light, `rgba(255,255,255,0.15)` in dark) for definition against similar-colored surfaces.

In dark mode, shadows are slightly intensified with higher opacity values to maintain visibility against dark backgrounds. The `shadow-border-*` variants automatically adapt their border color based on the active color scheme.

## Shapes

The shape language is **softly rounded** with a consistent 8px base radius. This provides a modern, approachable feel without being overly playful.

### Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Small buttons, chips, badges |
| `md` | 6px | Default buttons, inputs, cards |
| `lg` | 8px | Modals, drawers, large cards |
| `xl` | 12px | Feature cards, prominent containers |
| `full` | 9999px | Avatars, pills, circular elements |

Components support three shape variants:
- **default:** Respects the inherited radius from the design token scale.
- **square:** `rounded-none` -- removes all rounding for data-dense UIs.
- **rounded:** `rounded-full` -- fully circular/pill-shaped for avatars and tags.

## Components

All components follow consistent patterns for sizing, variants, and theming.

### Component Sizes

All interactive components share a unified 4-tier size system:

| Size | Height | Usage |
|------|--------|-------|
| `xs` | 24px | Inline badges, compact toolbars |
| `sm` | 30px | Dense UIs, table actions |
| `md` | 36px | Default -- standard forms and actions |
| `lg` | 44px | Touch targets, prominent CTAs |

### Buttons

Buttons support 7 visual variants covering all interaction patterns:

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| `default` | `background-100` | `foreground` | Secondary actions |
| `ghost` | Transparent | `foreground` | Tertiary, toolbar items |
| `primary` | `primary` (near-black) | `gray-100` | Primary actions |
| `link` | Transparent | `foreground` | Inline navigation |
| `error` | `accent-red` (#da2f35) | White | Destructive actions |
| `warning` | `accent-amber` (#ff990a) | Black | Cautionary actions |
| `success` | `accent-green` (#287a3a) | White | Positive confirmations |

All buttons include focus ring (`self-focus-ring`), disabled states, loading spinner support, and icon slots (prefix/suffix).

### Form Controls

Input fields share a consistent border style with:
- Default: 1px `border` color
- Hover: Semi-transparent primary
- Focus: Primary color border with 3px primary-alpha box-shadow
- Error: Red border with red-alpha box-shadow
- Disabled/Read-only: No hover or focus effects

### Feedback & Overlays

Overlays use a z-index stacking system starting at `--pxd-initial-index: 10`:
- `overlay-index`: Base overlay layer
- `popover-index`: Popovers above overlays
- `modal-index`: Modals above popovers

All overlay transitions use the `pxd-transition--fade` or `pxd-transition--fade-scale` classes with 200ms duration and ease-out timing. Exit transitions run 30% faster than enter transitions for snappy feel.

## Do's and Don'ts

- **Do** use the `primary` variant only for the single most important action per screen
- **Do** maintain the 4-tier size system (`xs`, `sm`, `md`, `lg`) across all interactive components
- **Do** use semantic color tokens (`foreground`, `background-100`, `border`) instead of raw palette values
- **Do** respect `prefers-reduced-motion` -- all animations must use `motion-safe:` prefix or check `--duration`
- **Do** use a size provider context for consistent size inheritance across component trees
- **Don't** mix rounded and square shapes in the same view
- **Don't** use raw hex colors when a semantic token exists
- **Don't** set explicit font families on components -- the global font stack handles this
- **Don't** use z-index values directly -- use the overlay manager system
- **Don't** create animations longer than 200ms for UI transitions
