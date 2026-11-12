module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ivory: "#F6EFE6", claret: "#5B1F2E", rose: "#C99A9A", champagne: "#C8AA7A" },
      fontFamily: { serif: ['"Cormorant Garamond"', "Georgia", "serif"], sans: ["Jost", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
