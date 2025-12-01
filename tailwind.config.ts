import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0b0f14'
        },
        foreground: {
          DEFAULT: '#e4e7eb'
        },
        brand: {
          DEFAULT: '#8b5cf6',
          foreground: '#ffffff'
        }
      }
    }
  },
  plugins: []
}

export default config
