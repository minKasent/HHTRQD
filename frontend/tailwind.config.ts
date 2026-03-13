import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "Playfair Display", "serif"],
        body: ["var(--font-body)", "Source Sans 3", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        sage: "hsl(var(--sage))",
        terracotta: "hsl(var(--terracotta))",
        clay: "hsl(var(--clay))",
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      boxShadow: {
        botanical: "0 4px 6px -1px rgba(45, 58, 49, 0.05)",
        "botanical-md": "0 10px 15px -3px rgba(45, 58, 49, 0.05)",
        "botanical-lg": "0 20px 40px -10px rgba(45, 58, 49, 0.05)",
        "botanical-xl": "0 25px 50px -12px rgba(45, 58, 49, 0.15)",
      },
      transitionDuration: {
        "400": "400ms",
        "500": "500ms",
        "700": "700ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
