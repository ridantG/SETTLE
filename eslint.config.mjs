// File: eslint.config.mjs
// FINAL, CORRECTED VERSION using the official Next.js plugin

import globals from "globals";
import tseslint from "typescript-eslint";
import pluginTailwind from "eslint-plugin-tailwindcss";
import nextPlugin from "@next/eslint-plugin-next"; // The correct import

export default [
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  ...tseslint.configs.recommended,
  {
    // This is the correct, modern way to include the Next.js plugin
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: { tailwindcss: pluginTailwind },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "warn",
    },
  },
  {
    ignores: [".next/", "dist/", "node_modules/"],
  },
];