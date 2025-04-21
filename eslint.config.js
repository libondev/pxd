import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'dist',
    'node_modules/*',
  ],

  jsonc: true,
  markdown: false,
  typescript: true,
  vue: true,

  rules: {
  },
})
