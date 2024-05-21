import transformerVariantGroup from '@unocss/transformer-variant-group'
import { animatedUno } from 'animated-unocss'
import { defineConfig, presetIcons, presetMini } from 'unocss'

export default defineConfig({
  content: {
    pipeline: {
      include: ['./src/**/*.{vue,tsx,ts}'],
    },
  },

  presets: [
    animatedUno({
      buildFullVersion: false,
    }),
    presetMini({
      variablePrefix: '',
    }),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': '-2px',
      },
    }),
  ],

  shortcuts: {
    'flex-center': 'flex justify-center items-center',
    'flex-col-center': 'flex flex-col justify-center items-center',
    'fixed-center': 'fixed left-50% top-50% translate-x--50% translate-y--50%',
    'absolute-center': 'absolute left-50% top-50% translate-x--50% translate-y--50%',
  },

  rules: [
    // va--2px => vertical-align: -2px
    [/^va-(.+)$/, ([, v]: string[]) => ({ 'vertical-align': v })],
    [/^rotate-y-full$/, () => ({ transform: 'rotateY(180deg)' })],
    [/^rotate-x-full$/, () => ({ transform: 'rotateX(180deg)' })],
    [/^letter-spacing-(.+)$/, ([, d]: string[]) => ({ 'letter-spacing': d })],
  ],

  transformers: [
    // hover:(bg-gray-400 font-medium) font-(light mono) ↓
    // hover:bg-gray-400 hover:font-medium font-light font-mono
    transformerVariantGroup(),
  ],

  theme: {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      danger: {
        DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
        foreground: 'hsl(var(--danger-foreground) / <alpha-value>)',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
    },
    borderRadius: {
      xl: `calc(var(--radius) + 4px)`,
      lg: `var(--radius)`,
      md: `calc(var(--radius) - 2px)`,
      sm: 'calc(var(--radius) - 4px)',
    },
  },
})
