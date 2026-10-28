import type { CSSProperties } from 'react'
import { z } from 'zod'

export const themeSchema = z.object({
  font: z.enum(['current', 'inter', 'system', 'serif']).default('current'),
  radius: z.number().min(0).max(32).default(12),
  buttonStyle: z.enum(['current', 'rounded', 'pill', 'square']).default('current'),
}).strict()
export type SiteTheme = z.infer<typeof themeSchema>

export function colourHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min, lightness = (max + min) / 2
  let hue = 0
  if (delta) {
    hue = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
    hue *= 60
  }
  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0
  return `${hue} ${saturation * 100}% ${lightness * 100}%`
}

export function themeStyle(accent: string, theme?: SiteTheme): CSSProperties {
  const style: CSSProperties & Record<`--${string}`, string> = {
    display: 'contents',
    '--primary': accent === '#ffb800' ? '43 99% 50%' : colourHsl(accent),
  }
  if (!theme) return style
  style['--radius'] = `${theme.radius}px`
  if (theme.font !== 'current') {
    const fonts = { inter: 'var(--font-inter), sans-serif', system: 'system-ui, sans-serif', serif: 'Georgia, serif' }
    style.fontFamily = fonts[theme.font]
    style['--cms-font'] = fonts[theme.font]
  }
  if (theme.buttonStyle !== 'current') {
    style['--cms-button-radius'] = theme.buttonStyle === 'pill' ? '9999px' : theme.buttonStyle === 'square' ? '0px' : `${theme.radius}px`
  }
  return style
}
