import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'dist',
    'node_modules/*',
  ],

  test: true,
  jsonc: true,
  markdown: false,
  typescript: true,
  vue: true,

  rules: {
    'curly': ['error', 'all'],
    'vue/custom-event-name-casing': ['error', 'kebab-case'],
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  },
})
