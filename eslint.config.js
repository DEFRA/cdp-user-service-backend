import neostandard from 'neostandard'
import vitest from '@vitest/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import promise from 'eslint-plugin-promise'
import jsdoc from 'eslint-plugin-jsdoc'
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
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        fetchMock: true
      }
    },
    plugins: {
      import: importPlugin,
      jsdoc,
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
      'import/resolver': {
        node: true
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
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
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
