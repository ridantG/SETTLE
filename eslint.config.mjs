// ESLint v9+ flat config for Next.js + TypeScript + Tailwind CSS
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import tailwind from 'eslint-plugin-tailwindcss';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
      'tailwindcss': tailwind
    },
    rules: {
      // Next.js web vitals
      ...nextPlugin.configs['core-web-vitals'].rules,
      // React Hooks recommendations
      ...reactHooks.configs.recommended.rules,

      // TypeScript tweaks
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Tailwind plugin (disable if you use lots of custom class names)
      'tailwindcss/no-custom-classname': 'off'
    },
    settings: {
      tailwindcss: {
        callees: ['cn', 'clsx', 'cva'],
        removeDuplicates: true
      }
    }
  },
  {
    // Ignore build artifacts and misc
    ignores: [
      'node_modules',
      '.next',
      'out',
      'dist',
      'coverage',
      '.storybook',
      '.vscode',
      '.vercel'
    ]
  }
);