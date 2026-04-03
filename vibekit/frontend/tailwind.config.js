/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"','sans-serif'],
        body:    ['"Satoshi"','sans-serif'],
        mono:    ['"JetBrains Mono"','monospace'],
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'float':     'float 6s ease-in-out infinite',
        'shimmer':   'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp:  { from:{ opacity:0, transform:'translateY(24px)' }, to:{ opacity:1, transform:'translateY(0)' }},
        fadeIn:  { from:{ opacity:0 }, to:{ opacity:1 }},
        float:   { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-16px)' }},
        shimmer: { from:{ backgroundPosition:'-200% 0' }, to:{ backgroundPosition:'200% 0' }},
      },
    }
  },
  plugins: [],
}
