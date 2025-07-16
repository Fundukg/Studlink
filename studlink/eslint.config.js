import baseConfig from '../eslint.config.js'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**', // Игнорировать всю папку сборки
      'node_modules/**',
      'eslint.config.js',
      'stylelint.config.js',
    ],
  },
  ...baseConfig,
  {
    ...reactRecommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },

  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.node.json',
      },
    },
  },
  {
    files: ['src/**/*'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.app.json',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@parkstick/backend/**',
                '!@parkstick/backend/**/', // Запрет всего
                '!@parkstick/backend/**/input', // Исключение для файлов с "input" в имени
              ],
              allowTypeImports: true,
              message: 'Only types and input schemas are allowed to be imported from backend workspace',
            },
          ],
        },
      ],
    },
  }
)
