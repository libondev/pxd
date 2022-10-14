module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  plugins: ['simple-import-sort'],
  extends: ['standard-with-typescript'],
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
    'jsx-quotes': ['error', 'prefer-single'],
    'spaced-comment': ['error', 'always', { markers: ['#__PURE__'] }],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off'
  }
}
