import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#111110",
        card: "#1A1A18",
        border: "#2C2C2A",
        text: {
          primary: "#F1EFE8",
          secondary: "#888780",
          faint: "#5F5E5A",
        },
        accent: {
          purple: "#534AB7",
          logo: "#26215C",
          icon: "#AFA9EC",
        },
        safe: {
          fg: "#1D9E75",
          bg: "#04342C",
        },
        watch: {
          fg: "#EF9F27",
          fgLight: "#FAC775",
          bg: "#412402",
        },
        danger: {
          fg: "#E24B4A",
          fgLight: "#F09595",
          bg: "#501313",
          bannerBg: "#2a1212",
          bannerBorder: "#791F1F",
        },
        target: {
          DEFAULT: "#378ADD",
          text: "#85B7EB",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      borderWidth: {
        DEFAULT: "0.5px",
      },
    },
  },
  plugins: [],
};

export default config;