const defaultTheme = require("tailwindcss/defaultTheme");
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        fontFamily: {
          sans: ["Space Grotesk", "sans-serif"],
        },
      },
    },
  },
  plugins: [],
};
