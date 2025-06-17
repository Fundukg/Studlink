import baseConfig from '../eslint.config.js'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**', // Игнорировать всю папку сборки
      'node_modules/**',
      'eslint.config.js', // Игнорировать сам конфиг ESLint
    ]
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
        'react/react-in-jsx-scope': "off"
      }
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
    },
  }
)
