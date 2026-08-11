/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070B17",
        navy: {
          900: "#070B17",
          800: "#0B132B",
          700: "#1C2541",
          600: "#2A385B",
        },
        violet: {
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          glow: "rgba(139, 92, 246, 0.4)",
        },
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
          glow: "rgba(34, 211, 238, 0.3)",
        },
        magenta: {
          500: "#EC4899",
          glow: "rgba(236, 72, 153, 0.3)",
        }
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        heavy: '24px',
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.37)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-glow': '0 0 25px rgba(139, 92, 246, 0.25)',
        'cyan-glow': '0 0 25px rgba(34, 211, 238, 0.25)',
      },
    },
  },
  plugins: [],
}
