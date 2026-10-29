export type Tone = 'violet' | 'green' | 'orange' | 'blue'

// Full class names (never built by string interpolation) so Tailwind can find them.
// `accent` is the bright text color: green and orange only pass contrast at 24px+, so use it for large text.
export const tones: Record<Tone, { tint: string; iconBg: string; text: string; accent: string; solid: string }> = {
  violet: {
    tint: 'bg-violet-tint',
    iconBg: 'bg-violet-icon',
    text: 'text-violet-dark',
    accent: 'text-violet',
    solid: 'bg-violet',
  },
  green: {
    tint: 'bg-green-tint',
    iconBg: 'bg-green-icon',
    text: 'text-green-dark',
    accent: 'text-green',
    solid: 'bg-green',
  },
  orange: {
    tint: 'bg-orange-tint',
    iconBg: 'bg-orange-icon',
    text: 'text-orange-dark',
    accent: 'text-orange',
    solid: 'bg-orange',
  },
  blue: { tint: 'bg-blue-tint', iconBg: 'bg-blue-icon', text: 'text-blue', accent: 'text-blue', solid: 'bg-blue' },
}
