const defaultTheme = require("tailwindcss/defaultTheme");
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        hover: "var(--hover)",
        background: "var(--background)",
      },
    },
  },
  plugins: [],
};
