/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif",'Barlow'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
      colors: {
        industrial: {
          black: '#060608',
          dark: '#0a0a0a',
          steel: '#1a1a1f',
        },
        primary: "#948979",
        primaryHover: "#393E46",

        dark: "#222831",
        darkGray: "#393E46",
        light: "#DFD0B8",

        sidebarBg: "#222831",
        sidebarText: "#DFD0B8",
        sidebarActive: "#393E46",
      },
      borderRadius: {
        btn: "8px",
        input: "6px",
      },
    },
  },
  plugins: [],
};
