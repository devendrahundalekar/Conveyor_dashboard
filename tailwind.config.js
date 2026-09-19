/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#12161a',
        panel: '#191e23',
        raised: '#20272e',
        line: '#2b333b',
        ink: '#e6eaee',
        mute: '#8b96a1',
        ok: '#3fb96a',
        warn: '#f0a21b',
        crit: '#ef4444',
        steel: '#5aa9e6',
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Barlow', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
