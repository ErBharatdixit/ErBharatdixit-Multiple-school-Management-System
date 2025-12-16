/** @type {import('tailwindcss').Config} */
export default {
      content: [
            "./index.html",
            "./src/**/*.{js,ts,jsx,tsx}",
      ],
      darkMode: 'class',
      theme: {
            extend: {
                  colors: {
                        border: "hsl(var(--border))",
                        input: "hsl(var(--input))",
                        ring: "hsl(var(--ring))",
                        background: "hsl(var(--background))",
                        foreground: "hsl(var(--foreground))",
                        primary: {
                              DEFAULT: "hsl(220, 90%, 56%)",
                              foreground: "hsl(0, 0%, 100%)",
                        },
                        secondary: {
                              DEFAULT: "hsl(340, 80%, 60%)",
                              foreground: "hsl(0, 0%, 100%)",
                        },
                        destructive: {
                              DEFAULT: "hsl(0, 84%, 60%)",
                              foreground: "hsl(0, 0%, 100%)",
                        },
                        muted: {
                              DEFAULT: "hsl(210, 40%, 96%)",
                              foreground: "hsl(215, 16%, 47%)",
                        },
                        accent: {
                              DEFAULT: "hsl(210, 40%, 96%)",
                              foreground: "hsl(222, 47%, 11%)",
                        },
                        card: {
                              DEFAULT: "hsl(0, 0%, 100%)",
                              foreground: "hsl(222, 47%, 11%)",
                        },
                  },
                  borderRadius: {
                        lg: "0.5rem",
                        md: "calc(0.5rem - 2px)",
                        sm: "calc(0.5rem - 4px)",
                  },
                  fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                  },
                  animation: {
                        "fade-in": "fadeIn 0.3s ease-in-out",
                        "slide-in": "slideIn 0.3s ease-out",
                  },
                  keyframes: {
                        fadeIn: {
                              "0%": { opacity: "0" },
                              "100%": { opacity: "1" },
                        },
                        slideIn: {
                              "0%": { transform: "translateY(-10px)", opacity: "0" },
                              "100%": { transform: "translateY(0)", opacity: "1" },
                        },
                  },
            },
      },
      plugins: [],
}
