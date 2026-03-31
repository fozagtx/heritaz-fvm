import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Space Grotesk', 'sans-serif'],
  		},
  		animation: {
  			fadeIn: 'fadeIn 0.5s ease-in',
  			slideUp: 'slideUp 0.5s ease-out',
  			'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'shiny-text': 'shiny-text 8s infinite',
  			'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
  			'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'live-pulse': 'livePulse 2s ease-in-out infinite',
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': { opacity: '0', transform: 'translateY(10px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			fadeInUp: {
  				'0%': { opacity: '0', transform: 'translateY(20px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			slideUp: {
  				'0%': { transform: 'translateY(100%)' },
  				'100%': { transform: 'translateY(0)' }
  			},
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'shiny-text': {
  				'0%, 90%, 100%': { 'background-position': 'calc(-100% - var(--shiny-width)) 0' },
  				'30%, 60%': { 'background-position': 'calc(100% + var(--shiny-width)) 0' }
  			},
  			livePulse: {
  				'0%, 100%': { transform: 'scale(1)', opacity: '1' },
  				'50%': { transform: 'scale(1.4)', opacity: '0.6' },
  			},
  		},
  		colors: {
  			'yo-yellow': '#D6FF34',
  			'bg': '#000000',
  			'surface-1': '#1D1E19',
  			'surface-2': '#262722',
  			'surface-3': '#292A2D',
  			'text-primary': '#EDEDED',
  			'card-blue': '#7DA2FF',
  			'card-blue-text': '#000434',
  			'card-mint': '#5DFFC0',
  			'card-mint-text': '#003F18',
  			'card-cyan': '#71F6FF',
  			'card-cyan-text': '#204150',
  			'card-lavender': '#C1ADFF',
  			'card-lavender-text': '#4D2050',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			'120': '120px',
  			'card': '30px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		boxShadow: {
  			glow: '0 0 20px rgba(214, 255, 52, 0.35)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
