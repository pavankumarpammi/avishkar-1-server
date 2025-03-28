module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in-out",
        "fade-in-up": "fadeInUp 0.8s ease-in-out",
        "spin-slow": "spin 15s linear infinite",
        "spin-reverse": "spinReverse 12s linear infinite",
        "float": "float 4s ease-in-out infinite",
        "float-delay": "float 5s ease-in-out infinite 1s",
        "gradient-x": "gradientX 15s ease infinite",
        "particle-fly": "particleFly 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        "shimmer": "shimmer 2s infinite linear",
        "bounce-once": "bounceOnce 0.5s forwards",
        "wave": "wave 1s infinite",
        "tab-slide": "tabSlide 0.4s ease-out forwards",
        "tab-pulse": "tabPulse 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        spinReverse: {
          "to": { transform: "rotate(-360deg)" }
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
          "100%": { transform: "translateY(0px)" }
        },
        gradientX: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        particleFly: {
          "from": { transform: "translate(-50%, -50%) translateX(0)", opacity: 1 },
          "to": { transform: "translate(-50%, -50%) translateX(40px)", opacity: 0 }
        },
        slideUp: {
          "from": { opacity: 0, transform: "translateY(30px)" },
          "to": { opacity: 1, transform: "translateY(0)" }
        },
        scaleIn: {
          "from": { opacity: 0, transform: "scale(0.9)" },
          "to": { opacity: 1, transform: "scale(1)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        bounceOnce: {
          "0%": { transform: "translateY(-20px)", opacity: 0 },
          "70%": { transform: "translateY(10px)" },
          "100%": { transform: "translateY(0)", opacity: 1 }
        },
        wave: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(1.5)" }
        },
        tabSlide: {
          "0%": { transform: "translateX(10px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 }
        },
        tabPulse: {
          "0%": { transform: "scale(0.97)", boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.7)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(99, 102, 241, 0)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)" }
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};