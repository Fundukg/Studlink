// eslint.config.js
import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginImport from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Базовые конфигурации
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,

  // Настройки плагинов
  {
    plugins: {
      import: eslintPluginImport,
    },
  },

  // Основные правила
  {
    ignores: ['node_modules', 'dist'],
    rules: {
      // Правила импорта
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
          },
        },
      ],

      // TypeScript правила
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // JSX правила (если используется)
      'jsx-a11y/anchor-is-valid': 'off',
      'react/react-in-jsx-scope': 'off',
      // Правила использования process.env
      // 'node/no-process-env': 'error',

      // Базовые ESLint правила
      curly: ['error', 'all'],
      'no-irregular-whitespace': [
        'error',
        {
          skipTemplates: true,
          skipStrings: true,
        },
      ],
      'no-console': [
        'error',
        {
          allow: ['info', 'error', 'warn'],
        },
      ],
    },
  }
)
