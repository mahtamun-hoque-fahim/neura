import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#1a7a4a",
          light: "#2da06a",
          pale: "#e8f5ee",
          mid: "#c2e8d2",
        },
        ink: "#0d1f16",
        muted: "#5a7a68",
        canvas: "#f5f0e8",
        paper: "#fdfaf4",
        toolbar: "#1a1a2e",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        dm: ["var(--font-dm-sans)", "sans-serif"],
        caveat: ["var(--font-caveat)", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
