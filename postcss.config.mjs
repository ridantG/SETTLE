// postcss.config.mjs

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // This is the crucial change. We are now using the new, dedicated plugin.
    '@tailwindcss/postcss': {},
    // Autoprefixer should still be here to ensure browser compatibility.
    autoprefixer: {},
  },
};

export default config;