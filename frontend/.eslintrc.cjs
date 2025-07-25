module.exports = {
  root: true,
  env: { browser: true, es2020: true, jest: true },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // Include this for new JSX Transform
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint', 'react', 'prettier'],
  rules: {
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'import/extensions': [
      'off',
      'ignorePackages',
      {
        js: 'always',
        jsx: 'always',
        ts: 'always',
        tsx: 'always',
      },
    ],
    'prettier/prettier': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
        'react/react-in-jsx-scope': 'off',
        'react/jsx-uses-react': 'off',
        'react/jsx-props-no-spreading': 'off',
        'import/no-unresolved': 'off',
        'import/no-absolute-path': 'off',
        'import/no-undef': 'off',
        'object-curly-newline': 'off',
        'no-console': 'off',
        'react/require-default-props': 'off',
        'no-nested-ternary': 'off',
        'arrow-parens': ['error', 'always'], // Ensure parentheses around arrow function arguments
        'no-unused-vars': 'off',
        'no-unused-expressions': ['error', { 'allowTernary': true }],
        'jsx-a11y/label-has-associated-control': [
          2,
          {
            labelComponents: ['CustomInputLabel'],
            labelAttributes: ['label'],
            controlComponents: ['CustomInput'],
            depth: 3,
          },
        ],
        '@typescript-eslint/no-unused-vars': 'error',
      },
    },
  ],
};
