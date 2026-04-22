import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Colores de grupos (de tu calendario)
        'grupo-g1a': '#3b82f6',
        'grupo-g1b': '#60a5fa',
        'grupo-g2a': '#ef4444',
        'grupo-g2b': '#f87171',
        'grupo-g3a': '#22c55e',
        'grupo-g3b': '#4ade80',
        'grupo-l1': '#8b5cf6',
        'grupo-l2': '#a78bfa',
        'grupo-l3': '#c4b5fd',
        
        // Colores de calendario (de tu calendario)
        'cal-work': '#ffffff',
        'cal-off': '#86efac',
        'cal-sunday': '#fca5a5',
        'cal-holiday': '#c4b5fd',
        
        // Colores de la app
        'app-green': '#bbf7d0',
        'app-red': '#fecaca',
        'app-purple': '#ddd6fe',
        'app-orange': '#fed7aa',
      },
    },
  },
  plugins: [],
}

export default config
