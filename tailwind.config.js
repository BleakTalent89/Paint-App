/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#0a0a0f',
          card: '#12121a',
          border: 'rgba(255,255,255,0.08)',
          purple: '#7c3aed',
          indigo: '#4f46e5',
        }
      },
      backgroundImage: {
        'forge-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #0d0b1a 50%, #0a0a0f 100%)',
      }
    },
  },
  plugins: [],
}
