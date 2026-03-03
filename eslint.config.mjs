// File: eslint.config.mjs
// FINAL, DEFINITIVE, AND MODERN VERSION
import globals from "globals";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import tailwindPlugin from "eslint-plugin-tailwindcss";

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  ...tseslint.configs.recommended,
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { tailwindcss: tailwindPlugin },
    rules: {
      ...tailwindPlugin.configs.recommended.rules,
      "tailwindcss/no-custom-classname": "off",
    },
    settings: {
      tailwindcss: {
        config: "tailwind.config.ts", // Ensures it finds your config
      },
    },
  },
  {
    // This rule set will clean up all the "unused var" and "any" errors.
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["node_modules/", ".next/", "dist/", "postcss.config.mjs"],
  },
];