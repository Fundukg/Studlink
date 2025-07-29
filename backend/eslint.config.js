import baseConfig from '../eslint.config.js'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import tseslint from 'typescript-eslint'
import nodePlugin from 'eslint-plugin-node'

export default tseslint.config(
  {
    ignores: [
      'dist/**', // Игнорировать всю папку сборки
      'node_modules/**',
      'eslint.config.js', // Игнорировать сам конфиг ESLint
    ],
  },
  {
    plugins: {
      node: nodePlugin,
    },
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
    rules: {
      'react/react-in-jsx-scope': 'off',
      'node/no-process-env': 'error',
    },
  }
)
