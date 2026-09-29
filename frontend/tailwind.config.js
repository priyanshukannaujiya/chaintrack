/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:    '#080C14',
        surface:       '#0E1420',
        'surface-2':   '#131B2B',
        border:        '#1E2D45',
        'border-light':'#243450',
        primary:       '#4F6EF7',
        'primary-dark':'#3A55E0',
        secondary:     '#7C5CFC',
        accent:        '#00D4AA',
        'accent-warm': '#F59E0B',
        textMain:      '#EEF2FF',
        textSub:       '#A8B8D8',
        textMuted:     '#5C738A',
        success:       '#10B981',
        warning:       '#F59E0B',
        danger:        '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin':     'spin 0.75s linear infinite',
        'ping':     'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
