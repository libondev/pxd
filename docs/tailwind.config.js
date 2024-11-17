import tailwindPreset from '../src/plugins/tailwind-preset'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{ts,vue}',
    './node_modules/pxd/dist/components/**/*.js',
  ],

  presets: [
    tailwindPreset,
  ],

  theme: {
    extend: {},
  },
}
