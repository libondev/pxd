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
    'style/brace-style': ['error', '1tbs'],
  },
})
