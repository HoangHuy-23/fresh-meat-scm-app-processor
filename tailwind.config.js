/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/app/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF4D6D", // màu thịt tươi sống chính
          light: "#FF758F",   // nhạt hơn
          dark: "#C9184A",    // đậm hơn
        },
      },
    },
  },
  plugins: [],
};
