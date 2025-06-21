/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./layout/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "poppins": ["poppins-regular", "sans-serif"],
      },
      colors: {
        "primary": "#3674AD",
        "secondary": "#476480",
        "dark-grey": "#33384B",
        "light-grey": "#757575",
        "input-grey": "#F3F3F3",
        "text-grey": "#5F6368",
        "header-bg": "#216AAE",
      },
    },
  },
  plugins: [],
}