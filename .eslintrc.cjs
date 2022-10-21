module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  plugins: ['unicorn', 'promise', 'import'],
  extends: [
    'standard-with-typescript',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
    './.eslintrc-auto-import.json'
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  ignorePatterns: [
    'CHANGELOG.md',
    'node_modules',
    'playground',
    'examples',
    'docs',
    'dist'
  ],
  rules: {
    'func-call-spacing': 'off',
    'jsx-quotes': ['error', 'prefer-single'],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    'vue/multi-word-component-names': 'off'
  }
}
