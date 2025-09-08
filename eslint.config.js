import neostandard from 'neostandard'
import tsParser from '@typescript-eslint/parser'
import tsEslintPlugin from '@typescript-eslint/eslint-plugin'
import n from 'eslint-plugin-n'
import promise from 'eslint-plugin-promise'
import jsdoc from 'eslint-plugin-jsdoc'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'
import vitest from 'eslint-plugin-vitest'
import globals from 'globals'

const customIgnores = [
  '.server',
  'coverage',
  '.husky',
  '.github',
  'node_modules',
  '.prettierrc.js',
  '.vite/setup-files.js',
  'vitest.config.*'
]

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...neostandard({
    env: ['node', 'vitest'],
    ignores: [...neostandard.resolveIgnoresFromGitignore(), ...customIgnores],
    noJsx: true,
    noStyle: true
  }),
  {
    files: ['**/*.{js,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsParser,
      sourceType: 'module',
      globals: {
        document: true,
        KeyboardEvent: true,
        Element: true,
        HTMLElement: true,
        location: true,
        window: true,
        localStorage: true,
        fetchMock: true,
        Option: true
      },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: new URL('.', import.meta.url).pathname
      }
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      import: importPlugin,
      jsdoc,
      n,
      promise,
      prettier,
      vitest
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ],
      'no-console': 'error',

      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-param': 'off',
      'jsdoc/require-property-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/require-returns': 'off',

      'import/extensions': ['error', 'always', { ignorePackages: true }],

      'import/default': 'off',
      'import/namespace': 'off',
      'n/no-extraneous-require': 'off',
      'n/no-extraneous-import': 'off',
      'n/no-missing-require': 'off',
      'n/no-missing-import': 'off',

      // Allow devDependencies in tests
      'n/no-unpublished-import': [
        'error',
        {
          allowModules: []
        }
      ]
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.cjs', '.js']
      },
      'import/resolver': {
        node: true,
        typescript: true
      }
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module'
    }
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node }
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'n/no-unpublished-require': [
        'error',
        {
          allowModules: []
        }
      ]
    }
  },
  vitest.configs.recommended,
  {
    files: [
      '.vite/**/*.js',
      '**/*.test.{js,cjs}',
      '**/__mocks__/**',
      '**/__fixtures__/**',
      'vitest.config.js'
    ],
    plugins: {
      vitest
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json']
      },
      globals: {
        ...vitest.environments.env.globals
      }
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'n/no-unpublished-import': [
        'error',
        {
          allowModules: ['vitest', 'vitest-mongodb']
        }
      ]
    }
  }
]
