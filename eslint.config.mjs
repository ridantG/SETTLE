// File: eslint.config.mjs
import globals from "globals";
import tseslint from "typescript-eslint";
import nextPlugin from "eslint-plugin-next";
import pluginTailwind from "eslint-plugin-tailwindcss";
import path from "path";

export default [
  {
    // ✅ Add global browser & Node.js variables
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // ✅ Add TypeScript recommended rules
  ...tseslint.configs.recommended,

  // ✅ Add Next.js recommended rules (removes the warning)
  {
    plugins: {
      next: nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },

  // ✅ TailwindCSS Plugin Configuration
  {
    plugins: {
      tailwindcss: pluginTailwind,
    },
    settings: {
      tailwindcss: {
        // ⬇️ Tailwind v4 has no config by default, so we point it to PostCSS
        // OR you can just leave this null to use defaults
        config: path.join(process.cwd(), "postcss.config.mjs"),
      },
    },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "warn",
      "tailwindcss/no-contradicting-classname": "error",
    },
  },

  // ✅ Ignore build and vendor folders
  {
    ignores: [".next/", "dist/", "node_modules/"],
  },
];
