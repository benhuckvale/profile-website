/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-accent': 'var(--color-primary-accent)',
        'heading-text': 'var(--color-heading-text)',
        'body-text': 'var(--color-body-text)',
        'subtle-text': 'var(--color-subtle-text)',
        'background-card': 'var(--color-background-card)',
        'background-page': 'var(--color-background-page)',
        'border-light': 'var(--color-border-light)',
        'border-divider': 'var(--color-border-divider)',
        'text-on-accent': 'var(--color-text-on-accent)',
      },
      fontFamily: {
        sans: ['Orbitron', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
}
