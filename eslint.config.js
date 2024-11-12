import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'dist',
    'shims/*',
    'playground/*',
    'node_modules/*',
  ],

  rules: {
    'vue/require-toggle-inside-transition': 'off',
  },
})
