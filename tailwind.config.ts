import type { Config } from 'tailwindcss'
import containerQueries from '@tailwindcss/container-queries'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Replaces Tailwind's palette so only MindStack tokens exist (no stray greys).
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      canvas: '#FAFAFD',
      line: '#ECEBF5',
      ink: '#1B2440',
      muted: '#4A5373',
      subtle: '#5B6380',
      mint: '#7EE0B5',
      violet: { DEFAULT: '#5B4BE0', dark: '#3B2DB8', tint: '#F1EEFF', icon: '#DAD3FF' },
      green: { DEFAULT: '#0A8F65', dark: '#066B4B', tint: '#E6F7F0', icon: '#C3EEDD' },
      orange: { DEFAULT: '#D9480F', dark: '#9A3D06', tint: '#FFF3E3', icon: '#FFDDB3' },
      blue: { DEFAULT: '#1450A3', tint: '#E8F2FF', icon: '#C9E0FF' },
    },
    fontFamily: {
      sans: ['Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
    },
    extend: {
      maxWidth: { content: '1240px' },
      borderColor: { DEFAULT: '#ECEBF5' },
      borderRadius: { card: '24px', panel: '28px', band: '32px' },
      boxShadow: {
        soft: '0 1px 2px rgba(27, 36, 64, 0.04), 0 8px 24px rgba(27, 36, 64, 0.06)',
        lift: '0 2px 6px rgba(27, 36, 64, 0.06), 0 16px 36px rgba(27, 36, 64, 0.12)',
      },
    },
  },
  plugins: [containerQueries],
} satisfies Config
