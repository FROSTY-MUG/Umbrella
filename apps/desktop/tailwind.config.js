/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./apps/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c0e",
        surface: {
          DEFAULT: "#0f171a",
          secondary: "#142024",
          tertiary: "#1b2a30",
          border: "#1f353d",
          chrome: "#0d1417"
        },
        umbrella: {
          green: "#10b981",
          emerald: "#059669",
          cyan: "#06b6d4",
          teal: "#0d9488",
          amber: "#f59e0b",
          red: "#ef4444",
          text: "#e2e8f0",
          muted: "#94a3b8",
          dark: "#05080a"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Consolas", "Courier New", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "5px",
        md: "6px",
        lg: "8px"
      }
    }
  },
  plugins: []
};
