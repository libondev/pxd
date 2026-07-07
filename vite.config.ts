import type { PluginOption } from '@voidzero-dev/vite-plus-core'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, lazyPlugins } from 'vite-plus'

export default defineConfig({
  fmt: {
    semi: false,
    tabWidth: 2,
    endOfLine: 'lf',
    printWidth: 100,
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: true,
    insertFinalNewline: true,
    sortImports: {
      sortSideEffects: true,
      internalPattern: ['~/', '@/', '#/'],
      newlinesBetween: false,
      groups: [
        ['type-import', 'type-internal', 'type-parent', 'type-sibling', 'type-index'],
        ['value-builtin', 'value-external'],
        'value-internal',
        ['value-parent', 'value-sibling', 'value-index'],
        'unknown',
      ],
    },
    sortPackageJson: true,
    sortTailwindcss: {
      preserveDuplicates: false,
      preserveWhitespace: false,
      functions: ['cn', 'useTailwindVariant'],
      stylesheet: './src/styles/tw.css',
    },
    patterns: [],
    ignorePatterns: [
      'dist',
      'node_modules',
      '.vscode',
      '.zed',
      '.agent',
      '.claude',
      '.codex',
      '.cursor',
      '.gemini',
      '.opencode',
      '*.md',
      './src/plugins/*.js',
    ],
  },

  lint: {
    jsPlugins: ['eslint-plugin-better-tailwindcss'],
    rules: {
      curly: 'error',
      'vitest/require-mock-type-parameters': 'off',
      'better-tailwindcss/no-deprecated-classes': 'error',
      'better-tailwindcss/enforce-shorthand-classes': 'error',
      'better-tailwindcss/no-unnecessary-whitespace': 'error',
      'better-tailwindcss/enforce-consistent-variable-syntax': [
        'error',
        {
          syntax: 'shorthand',
        },
      ],
      'better-tailwindcss/enforce-consistent-important-position': [
        'error',
        {
          position: 'recommended',
        },
      ],
    },
    plugins: ['oxc', 'react', 'eslint', 'import', 'vitest', 'promise', 'unicorn', 'typescript'],
    ignorePatterns: [
      'dist',
      'node_modules',
      '.vscode',
      '.zed',
      '.agent',
      '.claude',
      '.codex',
      '.cursor',
      '.gemini',
      '.opencode',
      '*.md',
      './src/plugins/*.js',
    ],
    settings: {
      'better-tailwindcss': {
        entryPoint: './src/styles/tw.css',
      },
      jsdoc: {
        ignorePrivate: false,
        ignoreInternal: false,
        ignoreReplacesDocs: true,
        overrideReplacesDocs: true,
        augmentsExtendsReplacesDocs: false,
        implementsReplacesDocs: false,
        exemptDestructuredRootsFromChecks: false,
        tagNamePreference: {},
      },
      vitest: {
        typecheck: false,
      },
    },
    env: {
      builtin: true,
    },
    globals: {},
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },

  plugins: lazyPlugins(() => [vue() as PluginOption]),

  run: {
    tasks: {
      typecheck: {
        command: 'vue-tsc -p tsconfig.app.json --noEmit',
      },
    },
  },

  staged: {
    '*.{js,ts,tsx,vue,html}': 'vp check --fix',
  },

  test: {
    globals: false,
    fileParallelism: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    server: {
      deps: {
        inline: [/@gdsicon\/vue/],
      },
    },
    deps: {
      optimizer: {
        web: {
          enabled: false,
        },
      },
    },
    pool: 'vmThreads',
  },
})
