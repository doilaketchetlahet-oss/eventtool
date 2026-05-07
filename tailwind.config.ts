import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(124,58,237,0.16)"
      },
      backgroundImage: {
        "radial-glow": "radial-gradient(circle at top, rgba(168,85,247,0.18), transparent 45%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.14), transparent 30%), radial-gradient(circle at 20% 80%, rgba(14,165,233,0.12), transparent 30%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -12px, 0)" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
