// File: eslint.config.mjs
// FINAL, DEFINITIVE, AND MODERN VERSION
// This version uses the new, recommended "flat config" array syntax,
// which eliminates the deprecation warning and is the professional standard.

import globals from "globals";
import tseslint from "typescript-eslint";
import pluginTailwind from "eslint-plugin-tailwindcss";

export default [
  {
    // This applies global browser and Node.js variables.
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // This is the core configuration for TypeScript files.
  // We use the spread operator '...' to include all the recommended rules.
  ...tseslint.configs.recommended,

  // This is the configuration for Tailwind CSS class sorting and validation.
  {
    plugins: {
      tailwindcss: pluginTailwind,
    },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "warn",
      "tailwindcss/no-contradicting-classname": "error",
    },
  },

  // This section ignores files that we don't want to lint.
  {
    ignores: [".next/", "dist/", "node_modules/"],
  },
];
