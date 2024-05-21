import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'dist',
    'shims/*',
    'playground/*',
    'node_modules/*',
  ],
})
