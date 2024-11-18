import type { PluginAPI } from 'tailwindcss/types/config'

function pxdClassNamesShortcuts({ addComponents }: PluginAPI) {
  addComponents({
    '.p-shadow-border, .p-focusable': {
      'box-shadow': '0 0 0 1px var(--gray-alpha-400)',
    },

    '.p-shadow-border-large': {
      'box-shadow': '0 0 0 1px #00000018, 0px 2px 2px #0000000a,0px 8px 16px -4px #0000000a',
    },

    '.p-ring': {
      'outline': '0',

      // '&:focus-within,&:focus-visible': {
      '&:focus-visible': {
        'box-shadow': 'var(--background-100) 0 0 0 2px, 0 0 0 4px hsl(var(--blue-700-value))',
      },

      // '&.p-shadow-border:focus-within,&.p-shadow-border:focus-visible': {
      '&.p-shadow-border:focus-visible': {
        'box-shadow': '0 0 0 1px var(--gray-alpha-400), 0 0 0 2px var(--background-100), 0 0 0 4px hsl(var(--blue-700-value))',
      },
    },

    '.p-focusable': {
      'outline': '0',
      'transition': 'box-shadow .15s',

      '&:not(:disabled,[disabled],[disabled=true],[data-disabled=true]):hover': {
        'box-shadow': '0 0 0 1px var(--gray-alpha-500)',
      },

      '&:not(:disabled,[disabled],[disabled=true],[data-disabled=true]):focus, &:not(:disabled,[disabled],[disabled=true],[data-disabled=true]):focus-within': {
        'box-shadow': '0 0 0 1px var(--gray-alpha-600), 0 0 0 3px rgba(0,0,0,.16)!important',
      },
    },

    '.p-focusable-error': {
      'box-shadow': '0 0 0 1px hsl(var(--red-900-value)), 0 0 0 3px hsl(var(--red-300-value))',

      '&:not(:disabled,[disabled],[disabled=true],[data-disabled=true]):hover': {
        'box-shadow': '0 0 0 1px hsl(var(--red-900-value)), 0 0 0 3px hsl(var(--red-500-value))',
      },
    },

    '.p-input': {
      'outline': '0',
      'font-family': 'inherit',
      'background-color': 'var(--background-100)',

      '&::placeholder': {
        color: 'hsl(var(--gray-500-value))',
      },

      '&:disabled,[disabled],[disabled=true],[data-disabled=true]': {
        'cursor': 'not-allowed!important',
        'background-color': 'hsl(var(--gray-100-value))!important',

        '&::placeholder': {
          opacity: '0',
        },
      },
    },

    '.p-select-list': {
      '&:has([data-highlighted]) [data-highlighted]': {
        'background-color': 'var(--gray-alpha-300)',
      },
      '&:not(:has([data-highlighted])) [data-state=checked]': {
        'background-color': 'var(--gray-alpha-300)',
      },
    },
  })
}

const tailwindPreset = {
  theme: {
    extend: {
      colors: {
        'foreground': 'hsla(var(--gray-1000-value), 1)',
        'background': {
          100: 'var(--background-100)',
          200: 'var(--background-200)',
        },
        'gray-alpha': {
          100: 'var(--gray-alpha-100)',
          200: 'var(--gray-alpha-200)',
          300: 'var(--gray-alpha-300)',
          400: 'var(--gray-alpha-400)',
          500: 'var(--gray-alpha-500)',
          600: 'var(--gray-alpha-600)',
          700: 'var(--gray-alpha-700)',
          800: 'var(--gray-alpha-800)',
          900: 'var(--gray-alpha-900)',
          1000: 'var(--gray-alpha-1000)',
        },
        'gray': {
          100: 'hsla(var(--gray-100-value), 1)',
          200: 'hsla(var(--gray-200-value), 1)',
          300: 'hsla(var(--gray-300-value), 1)',
          400: 'hsla(var(--gray-400-value), 1)',
          500: 'hsla(var(--gray-500-value), 1)',
          600: 'hsla(var(--gray-600-value), 1)',
          700: 'hsla(var(--gray-700-value), 1)',
          800: 'hsla(var(--gray-800-value), 1)',
          900: 'hsla(var(--gray-900-value), 1)',
          1000: 'hsla(var(--gray-1000-value), 1)',
        },
        'blue': {
          100: 'hsla(var(--blue-100-value), 1)',
          200: 'hsla(var(--blue-200-value), 1)',
          300: 'hsla(var(--blue-300-value), 1)',
          400: 'hsla(var(--blue-400-value), 1)',
          500: 'hsla(var(--blue-500-value), 1)',
          600: 'hsla(var(--blue-600-value), 1)',
          700: 'hsla(var(--blue-700-value), 1)',
          800: 'hsla(var(--blue-800-value), 1)',
          900: 'hsla(var(--blue-900-value), 1)',
          1000: 'hsla(var(--blue-1000-value), 1)',
        },
        'red': {
          100: 'hsla(var(--red-100-value), 1)',
          200: 'hsla(var(--red-200-value), 1)',
          300: 'hsla(var(--red-300-value), 1)',
          400: 'hsla(var(--red-400-value), 1)',
          500: 'hsla(var(--red-500-value), 1)',
          600: 'hsla(var(--red-600-value), 1)',
          700: 'hsla(var(--red-700-value), 1)',
          800: 'hsla(var(--red-800-value), 1)',
          900: 'hsla(var(--red-900-value), 1)',
          1000: 'hsla(var(--red-1000-value), 1)',
        },
        'amber': {
          100: 'hsla(var(--amber-100-value), 1)',
          200: 'hsla(var(--amber-200-value), 1)',
          300: 'hsla(var(--amber-300-value), 1)',
          400: 'hsla(var(--amber-400-value), 1)',
          500: 'hsla(var(--amber-500-value), 1)',
          600: 'hsla(var(--amber-600-value), 1)',
          700: 'hsla(var(--amber-700-value), 1)',
          800: 'hsla(var(--amber-800-value), 1)',
          900: 'hsla(var(--amber-900-value), 1)',
          1000: 'hsla(var(--amber-1000-value), 1)',
        },
        'green': {
          100: 'hsla(var(--green-100-value), 1)',
          200: 'hsla(var(--green-200-value), 1)',
          300: 'hsla(var(--green-300-value), 1)',
          400: 'hsla(var(--green-400-value), 1)',
          500: 'hsla(var(--green-500-value), 1)',
          600: 'hsla(var(--green-600-value), 1)',
          700: 'hsla(var(--green-700-value), 1)',
          800: 'hsla(var(--green-800-value), 1)',
          900: 'hsla(var(--green-900-value), 1)',
          1000: 'hsla(var(--green-1000-value), 1)',
        },
        'teal': {
          100: 'hsla(var(--teal-100-value), 1)',
          200: 'hsla(var(--teal-200-value), 1)',
          300: 'hsla(var(--teal-300-value), 1)',
          400: 'hsla(var(--teal-400-value), 1)',
          500: 'hsla(var(--teal-500-value), 1)',
          600: 'hsla(var(--teal-600-value), 1)',
          700: 'hsla(var(--teal-700-value), 1)',
          800: 'hsla(var(--teal-800-value), 1)',
          900: 'hsla(var(--teal-900-value), 1)',
          1000: 'hsla(var(--teal-1000-value), 1)',
        },
        'purple': {
          100: 'hsla(var(--purple-100-value), 1)',
          200: 'hsla(var(--purple-200-value), 1)',
          300: 'hsla(var(--purple-300-value), 1)',
          400: 'hsla(var(--purple-400-value), 1)',
          500: 'hsla(var(--purple-500-value), 1)',
          600: 'hsla(var(--purple-600-value), 1)',
          700: 'hsla(var(--purple-700-value), 1)',
          800: 'hsla(var(--purple-800-value), 1)',
          900: 'hsla(var(--purple-900-value), 1)',
          1000: 'hsla(var(--purple-1000-value), 1)',
        },
        'pink': {
          100: 'hsla(var(--pink-100-value), 1)',
          200: 'hsla(var(--pink-200-value), 1)',
          300: 'hsla(var(--pink-300-value), 1)',
          400: 'hsla(var(--pink-400-value), 1)',
          500: 'hsla(var(--pink-500-value), 1)',
          600: 'hsla(var(--pink-600-value), 1)',
          700: 'hsla(var(--pink-700-value), 1)',
          800: 'hsla(var(--pink-800-value), 1)',
          900: 'hsla(var(--pink-900-value), 1)',
          1000: 'hsla(var(--pink-1000-value), 1)',
        },
      },

      borderRadius: {
        inherit: 'inherit',
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      fontSize: {
        0: '0',
        em: '1em',
      },

      lineHeight: {
        0: '0',
        full: '100%',
      },

      keyframes: {
        'fade': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'flash-loading': {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'fade-loading': {
          '0%': { opacity: 0.2 },
          '20%': { opacity: 1 },
          '100%': { opacity: 0.2 },
        },
        'collapse-slide-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'collapse-slide-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },

      animation: {
        'fade-in': 'fade .25s ease',
        'fade-out': 'fade .25s ease reverse',
        'collapse-slide-up': 'collapse-slide-up .25s ease',
        'collapse-slide-down': 'collapse-slide-down .25s ease',
        'flash-loading': 'flash-loading 8s ease-in-out infinite',
        'fade-loading': 'fade-loading 1.4s ease-in-out infinite both',
      },
    },
  },

  plugins: [
    pxdClassNamesShortcuts,
  ],
}

export default tailwindPreset
