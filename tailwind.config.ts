import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emeraldDark: "#075D46",
        emeraldBrand: "#0D8063",
        mint: "#E8F4EF",
        cream: "#F8F6EF",
        gold: "#D9A62E",
        ink: "#173A34",
        muted: "#687974",
        success: "#2B9B70",
        warning: "#E2A82B",
        danger: "#D76161"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(7, 93, 70, 0.12)",
        card: "0 8px 24px rgba(7, 93, 70, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
