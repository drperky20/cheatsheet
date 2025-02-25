
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          100: "rgba(0, 178, 169, 0.1)",
          200: "rgba(0, 178, 169, 0.2)",
          300: "rgba(0, 178, 169, 0.3)",
          400: "rgba(0, 178, 169, 0.4)",
          500: "rgba(0, 178, 169, 0.5)",
          600: "rgba(0, 178, 169, 0.6)",
          700: "rgba(0, 178, 169, 0.7)",
          800: "rgba(0, 178, 169, 0.8)",
          900: "rgba(0, 178, 169, 0.9)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          100: "rgba(123, 94, 167, 0.1)",
          200: "rgba(123, 94, 167, 0.2)",
          300: "rgba(123, 94, 167, 0.3)",
          400: "rgba(123, 94, 167, 0.4)",
          500: "rgba(123, 94, 167, 0.5)",
          600: "rgba(123, 94, 167, 0.6)",
          700: "rgba(123, 94, 167, 0.7)",
          800: "rgba(123, 94, 167, 0.8)",
          900: "rgba(123, 94, 167, 0.9)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scale: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        slideIn: "slideIn 0.5s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        scale: "scale 3s ease-in-out infinite",
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      boxShadow: {
        'glass': '0 4px 12px -2px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
        'glass-active': '0 2px 6px -1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
