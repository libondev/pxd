import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default antfu(
  {
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
  },
  {
    plugins: {
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    rules: {
      'better-tailwindcss/enforce-consistent-class-order': ['error', { order: 'improved' }],
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-unnecessary-whitespace': 'error',
      'better-tailwindcss/no-deprecated-classes': 'error',
      'better-tailwindcss/enforce-consistent-variable-syntax': ['error', { syntax: 'shorthand' }],
      'better-tailwindcss/enforce-consistent-important-position': ['error', { position: 'recommended' }],
      'better-tailwindcss/enforce-shorthand-classes': 'error',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/tw.css',
      },
    },
  },
)
