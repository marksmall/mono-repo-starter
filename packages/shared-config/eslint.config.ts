import vitest from '@vitest/eslint-plugin';
import eslintConfig from '@tpzdsp/eslint-config-dsp/eslint';
import noOnlyTests from 'eslint-plugin-no-only-tests';

export const createLibraryEslintConfig = ({ includeTsx = false, globals = {} } = {}) => {
  const sourceFiles = includeTsx ? ['**/*.ts', '**/*.tsx'] : ['**/*.ts'];

  return [
    {
      name: 'ignores',
      ignores: ['dist/', 'node_modules/'],
    },
    ...eslintConfig,
    {
      name: 'app-overrides',
      files: sourceFiles,
      plugins: {
        'no-only-tests': noOnlyTests,
      },
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals,
        parserOptions: {
          project: './tsconfig.json',
        },
      },
      rules: {
        'no-undef': 'off',
        'no-only-tests/no-only-tests': 'error',
        '@typescript-eslint/naming-convention': [
          'error',
          { selector: 'parameter', format: null, filter: { regex: '^_$', match: true } },
          { selector: 'default', format: ['camelCase'] },
          { selector: 'import', format: ['camelCase', 'PascalCase'] },
          { selector: 'function', format: ['camelCase', 'PascalCase'] },
          { selector: 'typeLike', format: ['PascalCase'] },
          { selector: 'typeProperty', format: null },
          { selector: 'enumMember', format: ['PascalCase'] },
          { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
          { selector: 'objectLiteralProperty', format: null },
          { selector: 'objectLiteralMethod', format: ['camelCase', 'PascalCase'] },
        ],
      },
    },
    {
      name: 'function-style-errors',
      files: sourceFiles,
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'FunctionExpression',
            message: 'Use ES6 arrow functions instead.',
          },
          {
            selector: 'FunctionDeclaration',
            message: 'Use arrow functions instead of function declarations.',
          },
          {
            selector: 'ForStatement',
            message:
              'Use functional iterators like .map(), .forEach(), or for...of instead of a manual for-loop.',
          },
          {
            selector: 'ForInStatement',
            message:
              'Avoid for...in loops as they iterate over inherited properties. Use Object.keys() or Object.entries() instead.',
          },
        ],
      },
    },
    {
      name: 'class-service-overrides',
      files: ['**/*Service/**/*.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'FunctionDeclaration',
            message: 'Use arrow functions instead of function declarations.',
          },
          {
            selector: 'ForStatement',
            message:
              'Use functional iterators like .map(), .forEach(), or for...of instead of a manual for-loop.',
          },
          {
            selector: 'ForInStatement',
            message:
              'Avoid for...in loops as they iterate over inherited properties. Use Object.keys() or Object.entries() instead.',
          },
        ],
      },
    },
    {
      name: 'config-overrides',
      files: ['*.config.ts', '*.config.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      name: 'test-overrides',
      files: ['**/*.test.*', '**/__tests__/**/*'],
      languageOptions: {
        globals: vitest.environments.env.globals,
      },
      rules: {
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-shadow': 'off',
        'no-use-before-define': 'off',
        'import/no-extraneous-dependencies': 'off',
        'no-restricted-imports': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/pseudo-random': 'off',
        'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expect*'] }],
      },
    },
  ];
};