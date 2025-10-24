// File: eslint.config.mjs
// FINAL, DEFINITIVE, AND CORRECTED VERSION

import globals from "globals";
import tseslint from "typescript-eslint";
import pluginTailwind from "eslint-plugin-tailwindcss";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...tseslint.configs.recommended,
  {
    plugins: { "@next/next": nextPlugin },
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
    // THE FIX IS HERE: We explicitly point the plugin to your config file.
    settings: {
      tailwindcss: {
        // Make sure this filename matches yours (e.g., tailwind.config.js)
        config: "tailwind.config.ts", 
      },
    },
  },
  {
    ignores: [".next/", "dist/", "node_modules/"],
  },
];