/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0b4ea2',
          dark: '#083c7d',
          light: '#1e66c6',
        },
        bg: '#f0f3f8',
        panel: '#ffffff',
        raised: '#f8fafc',
        line: '#e2e8f0',
        ink: '#1e293b',
        mute: '#64748b',
        ok: '#10b981',
        warn: '#f59e0b',
        crit: '#ef4444',
        coral: '#e76059',
        steel: '#0b4ea2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

