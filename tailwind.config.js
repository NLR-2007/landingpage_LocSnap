/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light "in-app" palette: warm cream page, white cards, green actions.
        cream: '#F7F5EC',
        card: { DEFAULT: '#FFFFFF', foreground: '#1B1E22' },
        ink: '#1B1E22',
        line: '#E7E3D6',
        /*
         * shadcn/ui-compatible tokens, mapped onto the palette above so pasted
         * shadcn components (bg-background, text-muted-foreground, bg-primary…)
         * render in the site's own colours instead of undefined utilities.
         */
        background: '#F7F5EC',
        foreground: '#1B1E22',
        primary: { DEFAULT: '#0E7C91', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#EFEBDD', foreground: '#1B1E22' },
        muted: { DEFAULT: '#EFEBDD', foreground: '#6B7078' },
        accent: { DEFAULT: '#E4F1F3', foreground: '#0A5E6E' },
        destructive: { DEFAULT: '#B3261E', foreground: '#FFFFFF' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#1B1E22' },
        input: '#E7E3D6',
        ring: '#0E7C91',
        // Primary action colour. The token keeps the name "green" so existing
        // classes need no churn, but the values are the app's teal/navy brand
        // (Geo Snap - NLR moved off green), so the site matches the app.
        green: {
          DEFAULT: '#0E7C91',
          light: '#12A0B8',
          dark: '#0A5E6E',
        },
        // Cyan brand accent from the app icon (used sparingly on light).
        brand: {
          DEFAULT: '#00BCD4',
          light: '#00CFE8',
          dim: '#0B7C8C',
        },
      },
      fontFamily: {
        geist: ["'Geist'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ["'Space Grotesk'", "'Geist'", 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 40px -12px rgba(14,124,145,0.28)',
        card: '0 1px 2px rgba(27,30,34,0.04), 0 8px 24px -12px rgba(27,30,34,0.12)',
      },
    },
  },
  plugins: [],
};
