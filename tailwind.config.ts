import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        valorant: {
          bg: "#0F1923",
          primary: "#FF4655",
          accent: "#0AC8B9",
          ink: "#ECE8E1"
        }
      },
      boxShadow: {
        neon: "0 0 10px rgba(255,70,85,0.6)"
      }
    }
  },
  plugins: []
}
export default config
