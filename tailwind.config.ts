import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { border: "hsl(var(--border))", background: "hsl(var(--background))", foreground: "hsl(var(--foreground))", muted: "hsl(var(--muted))", "muted-foreground": "hsl(var(--muted-foreground))", card: "hsl(var(--card))", primary: "hsl(var(--primary))", "primary-foreground": "hsl(var(--primary-foreground))", accent: "hsl(var(--accent))", destructive: "hsl(var(--destructive))" }, borderRadius: { lg: "0.5rem", md: "0.375rem", sm: "0.25rem" } } },
  plugins: []
};

export default config;
