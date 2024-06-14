const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./components/*.{js,ts,jsx,tsx}",
    "./renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      cst: "810px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
    },
    colors: {
      // use colors only specified
      ...colors,
      indigo: {
        100: "#cee0f3",
        200: "#9dc2e7",
        300: "#6da3da",
        400: "#3c85ce",
        500: "#0b66c2",
        600: "#09529b",
        700: "#073d74",
        800: "#04294e",
        900: "#021427",
      },
    },
    extend: {},
  },
  plugins: [],
};
