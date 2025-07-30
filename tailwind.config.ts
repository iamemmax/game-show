import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      height: {
        'ios-safe': '-webkit-fill-available'
      },
      backgroundPosition: {
        'bottom-right-offset': 'bottom -10% right -10%',
      },
      fontFamily: {
        verdana: ['verdana', 'sans-serif'],
        gilroyMedium: ['gilroy-medium', 'sans-serif'],
        gilroyHeavy: ['gilroy-heavy', 'sans-serif'],
        gilroyBold: ['gilroy-bold', 'sans-serif'],
        sans: ['var(--font-sans)'],
        heading: ['var(--font-heading)'],
        display: ['var(--font-display)'],
        outfit: ['var(--font-outfit)'],
        montserrat: ['var(--font-montserrat)'],
        platypi: ['var(--font-platypi)'],
        lucky: ['var(--font-lucky)'],
        anton: ['var(--font-anton)']
      },
      fontSize: {
        xxs: '.625rem',
      },
      colors: {
        'dash-dark-bg': 'var(--dash-dark-bg)',
        'light-dark-text': 'var(--light-dark-text)',
        'divider-line': 'var(--divider-line)',
        success: 'var(--success)',
        'light-bg': 'var(--light-bg)',
        'dash-light-bg': 'var(--dash-light-bg)',
        'light-accent-bg': 'var(--light-accent-bg)',
        'dark-text': 'var(--dark-text)',
        'light-text': 'var(--light-text)',
        'label-text': 'var(--label-text)',
        'solid-underline': 'var(--solid-underline)',
        'main': 'var(--main)',
        'main-light': 'var(--main-light)',
        'main-bg': 'var(--main-bg)',
        'helper': 'var(--helper)',
        'helper-dark': 'var(--helper-dark)',
        'body': 'var(--body)',


        'input-bg': 'var(--input-bg)',
        'input-placeholder': 'var(--input-placeholder)',
        'sidebar-link-active': 'var(--sidebar-link-active)',
        'card-border': 'var(--card-border)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'var(--main-solid)',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      screens: {
        '3xl': '1920px', // Adjust the value based on the screen size you want
        '4xl': '2000px', // Add custom screen size for 350px
        'xxscren': '370px', // Add custom screen size for 350px
      },

      // maxHeight: {
      //   'modal-content': [
      //     'calc(75vh + 5rem) /* fallback for Opera, IE and etc. */',
      //     'calc(75svh + 5rem)',
      //   ],
      //   'modal-body': [
      //     'calc(75vh) /* fallback for Opera, IE and etc. */',
      //     'calc(75svh)',
      //   ],
      // },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        card: '0 4px 44px rgba(196,196,196,0.12)',
        popover: '0px 4px 44px 0px rgba(196, 196, 196, 0.24)',
      },
      borderRadius: {
        10: '0.625rem',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "slowSpin": 'spin 40s linear infinite', // You can change the speed here
        'spin-slow': 'spin 5s linear infinite',
        'vertical-slide': 'vertical-slide 20s infinite linear',
        'indeterminate-progress': 'indeterminate-progress 1.5s infinite linear',
      },
      keyframes: {

        pulseBackground: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        'vertical-slide': {
          '0%': {
            transform: 'translate(0px, 0px)',
          },

          '100%': {
            transform: 'translate(0px, -100%)',
          },
        },
        'scale-up': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(3)' },
        },
        'indeterminate-progress': {
          '0%': {
            transform: 'translateX(0) scaleX(0)',
          },
          '40%': {
            transform: 'translateX(0) scaleX(0.4)',
          },
          '100%': {
            transform: 'translateX(100%) scaleX(0.5)',
          },
        },
      },
    },
  },

  plugins: [],
};
export default config;
