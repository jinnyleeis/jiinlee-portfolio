import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
            colors: {
        cream: "#FFFDF8",
        "accent-orange": "#FFB84C",
        "accent-yellow": "#FFD86E",
        "accent-mint": "#C1E5C0",
        "accent-blue": "#368AFF",
        "border-soft": "#E0E0E0",
        "text-main": "#2E2E2E",
      },
    },
  },
  plugins: [],
};
export default config;
