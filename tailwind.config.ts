import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        patina: {
          blue: '#7BA8A8',
          deep: '#6B9999',
        },
        teal: {
          transformative: '#00A896',
          dark: '#008B8B',
        },
        cloud: {
          dancer: '#F0EEE9',
        },
      },
    },
  },
  plugins: [],
};

export default config;
