module.exports = {
  root: true,
  env: {
    browser: true,
    es2022:  true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion:  'latest',
    sourceType:   'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: '18.3' },
  },
  rules: {
    'no-unused-vars':          ['warn', { argsIgnorePattern: '^_' }],
    'react/prop-types':        'off',
    'react/display-name':      'off',
    'no-console':              ['warn', { allow: ['warn', 'error'] }],
  },
}
