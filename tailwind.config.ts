import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
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
      spacing: {
        "xs": "0.5rem",
        "sm": "1rem",
        "md": "1.5rem",
        "lg": "2rem",
        "xl": "2.5rem",
        "2xl": "3rem",
        "3xl": "3.5rem",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Arena brand colors - enhanced
        violet: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3f0f5c",
        },
        cyan: {
          50: "#ecf9ff",
          100: "#d9f2ff",
          200: "#b5e7ff",
          300: "#7dd3fc",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#0c3d50",
        },
        // Additional neutral grays for better dark mode
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          150: "#e5e9f0",
          200: "#e2e8f0",
          300: "#cbd5e1",
          350: "#b1bcc8",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          650: "#3d4556",
          700: "#334155",
          750: "#2b3441",
          800: "#1e293b",
          850: "#1a202e",
          900: "#0f172a",
          950: "#020617",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        // Layered shadows for depth
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        // Glow shadows
        "glow-violet": "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)",
        "glow-violet-lg": "0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)",
        "glow-cyan": "0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(34, 211, 238, 0.2)",
        "glow-cyan-lg": "0 0 30px rgba(34, 211, 238, 0.5), 0 0 60px rgba(34, 211, 238, 0.3)",
        "glow-gradient": "0 0 25px rgba(139, 92, 246, 0.3), 0 0 50px rgba(34, 211, 238, 0.2)",
        // Depth shadows
        "depth-1": "0 2px 4px rgba(0, 0, 0, 0.1)",
        "depth-2": "0 4px 12px rgba(0, 0, 0, 0.15)",
        "depth-3": "0 8px 24px rgba(0, 0, 0, 0.2)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        "glow": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.7",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(139, 92, 246, 0.8)",
          },
        },
        "gradient-shift": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
        "slide-in-from-top": {
          from: {
            transform: "translateY(-100%)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "slide-out-to-top": {
          from: {
            transform: "translateY(0)",
            opacity: "1",
          },
          to: {
            transform: "translateY(-100%)",
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 6s ease-in-out infinite",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-out-to-top": "slide-out-to-top 0.3s ease-out",
      },
      backgroundImage: {
        "gradient-arena": "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(34, 211, 238, 0.15) 100%)",
        "gradient-arena-strong": "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
        "gradient-dark": "linear-gradient(to br, #020617 0%, #0f172a 50%, #020617 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
