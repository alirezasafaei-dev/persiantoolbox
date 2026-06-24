module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'build', 'coverage', 'mobile-app'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'jsx-a11y'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',

    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',

    // General rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',

    // Code style
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    indent: ['error', 2, { SwitchCase: 1, ignoredNodes: ['TemplateLiteral *', 'TemplateLiteral', 'TSReturnType', 'TSTypeAnnotation', 'FunctionDeclaration > .TSReturnType.typeAnnotation', 'FunctionExpression > .TSReturnType.typeAnnotation', 'TSFunctionType > .TSReturnType.typeAnnotation'] }],
    'max-len': ['error', { code: 200, ignoreUrls: true, ignoreStrings: true }],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',

    // Best practices
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'spaced-comment': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'no-multi-spaces': 'error',

    // Performance
    'react-hooks/exhaustive-deps': 'warn',
    'react/button-has-type': 'error',
    'no-loop-func': 'warn',

    // Security
    'no-undef': 'error',
    // Temporary guard: upstream rule runtime crashes in CI on minimatch interop.
    'jsx-a11y/label-has-associated-control': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'jsx-a11y': {
      components: {
        Button: 'button',
        Link: 'a',
      },
    },
  },
  overrides: [
    {
      files: ['lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'shared/**/*.{ts,tsx}'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'jsx-a11y/no-autofocus': 'off',
        'react-refresh/only-export-components': 'off',
      },
    },
    {
      files: ['tests/**/*.{ts,tsx}', '**/*.config.{ts,js,cjs,mjs}', '*.config.{ts,js,cjs,mjs}'],
      rules: {
        'react-refresh/only-export-components': 'off',
      },
    },
    {
      files: ['scripts/**/*.{ts,tsx}', '*.ts'],
      rules: {
        'react-refresh/only-export-components': 'off',
      },
    },
  ],
};
