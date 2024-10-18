import tailwindPreset from './src/plugins/tailwind-preset'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,vue}'],

  presets: [
    tailwindPreset,
  ],

  theme: {
    extend: {},
  },
}
