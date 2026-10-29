// The checks that run on every page and lesson screen:
//   axe       WCAG 2.2 A and AA rules, plus axe's best practices
//   targets   every link, button and field is at least 44×44px
//   keyboard  Tab reaches every control; each one shows a focus ring with 3:1 contrast that nothing
//             covers; Esc then Tab leaves the code editor
//   reflow    at phone size, nothing scrolls sideways at 320px wide
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
const MIN_TARGET = 44

type FocusStep = { tag?: string; problem?: string; stuck?: string; end?: boolean }

declare global {
  interface Window {
    a11y: ReturnType<typeof toolkit>
  }
}

// Checks the page as it is now. Leave out the keyboard walk after clicking around: it starts from
// wherever focus is, so it's most useful on a freshly opened page.
export async function checkAccessibility(page: Page, state: string, { keyboard = true } = {}) {
  await test.step(state, async () => {
    const phone = Boolean(test.info().project.use.isMobile)
    expect.soft(await findProblems(page, { keyboard, phone }), state).toEqual({ axe: [], targets: [], keyboard: [], reflow: [] })
  })
}

export async function findProblems(page: Page, { keyboard = true, phone = false } = {}) {
  await page.evaluate(`void (window.a11y ??= (${toolkit})())`)
  await page.evaluate(() => window.a11y.settle())
  return {
    axe: await axeProblems(page),
    targets: await page.evaluate((min) => window.a11y.smallTargets(min), MIN_TARGET),
    keyboard: keyboard ? await keyboardProblems(page) : [],
    reflow: phone ? await reflowProblems(page) : [],
  }
}

async function axeProblems(page: Page) {
  // axe can't run inside a frame that blocks scripts, and trying stalls the scan. The only one is the
  // web lessons' preview of the learner's own page.
  const { violations } = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .exclude('iframe[sandbox]:not([sandbox~="allow-scripts"])')
    .analyze()
  return violations.flatMap((rule) =>
    rule.nodes.map((node) => {
      const html = node.html.length > 100 ? `${node.html.slice(0, 99)}…` : node.html
      const why = (node.failureSummary ?? '').split('\n').slice(1).map((line) => line.trim()).join(' ')
      return `${rule.id}: ${html} → ${why}`
    }),
  )
}

// Tabs from wherever focus is to the end of the page, checking each stop.
async function keyboardProblems(page: Page) {
  await page.evaluate(() => window.a11y.startFocusWalk())
  try {
    const problems: string[] = []
    let previous: string | undefined
    for (let presses = 0; presses < 400; presses++) {
      // The code editor keeps Tab for indenting, and tells you to press Esc first to leave.
      if (previous === 'TEXTAREA') await page.keyboard.press('Escape')
      await page.keyboard.press('Tab')
      const step: FocusStep = await page.evaluate(() => window.a11y.checkFocus())
      if (step.problem) problems.push(step.problem)
      if (step.stuck) {
        const keys = previous === 'TEXTAREA' ? "Esc then Tab doesn't leave" : "Tab doesn't move on from"
        return [...problems, `${keys} ${step.stuck}`]
      }
      if (step.end) return problems
      previous = step.tag
    }
    return [...problems, 'Tabbing never reached the end of the page']
  } finally {
    await page.evaluate(() => window.a11y.endFocusWalk())
  }
}

async function reflowProblems(page: Page) {
  const size = page.viewportSize()
  if (!size) return []
  await page.setViewportSize({ width: 320, height: size.height })
  try {
    return await page.evaluate(() => window.a11y.reflow())
  } finally {
    await page.setViewportSize(size)
  }
}

// Runs inside the page (installed as window.a11y), so it measures what the browser actually drew.
function toolkit() {
  type Color = [number, number, number, number]

  const describe = (el: Element) => {
    const labels =
      el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
        ? [...(el.labels ?? [])].map((label) => label.textContent).join(' ')
        : ''
    const text = (el.getAttribute('aria-label') || labels || el.textContent || el.getAttribute('placeholder') || '')
      .replace(/\s+/g, ' ')
      .trim()
    const tag = el.tagName.toLowerCase()
    if (!text) return `<${tag} class="${el.getAttribute('class') ?? ''}">`
    return `<${tag}> “${text.length > 60 ? `${text.slice(0, 59)}…` : text}”`
  }

  const parse = (value: string): Color | null => {
    const parts = value.match(/[\d.]+/g)?.map(Number)
    return value.startsWith('rgb') && parts && parts.length >= 3 ? [parts[0], parts[1], parts[2], parts[3] ?? 1] : null
  }
  const over = (top: Color, below: Color): Color => [
    top[0] * top[3] + below[0] * (1 - top[3]),
    top[1] * top[3] + below[1] * (1 - top[3]),
    top[2] * top[3] + below[2] * (1 - top[3]),
    1,
  ]
  const luminance = ([r, g, b]: Color) => {
    const channel = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  }
  const contrast = (a: Color, b: Color) => {
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (high + 0.05) / (low + 0.05)
  }
  // What shows behind an element: its own and its parents' backgrounds, painted onto white.
  const backdrop = (el: Element | null) => {
    const layers: Color[] = []
    for (let node = el; node; node = node.parentElement) {
      const color = parse(getComputedStyle(node).backgroundColor)
      if (color && color[3] > 0) layers.push(color)
      if (color && color[3] === 1) break
    }
    return layers.reduceRight<Color>((below, layer) => over(layer, below), [255, 255, 255, 1])
  }

  // The focus ring is an outline on the element, or on a parent: the code editor and the answer
  // cards draw it around the whole box.
  const ringOf = (el: Element) => {
    for (let node: Element | null = el, depth = 0; node && depth < 3; node = node.parentElement, depth++) {
      const style = getComputedStyle(node)
      if (style.outlineStyle === 'none') continue
      if (style.outlineStyle !== 'auto' && parseFloat(style.outlineWidth) < 2) continue
      const color = parse(style.outlineColor)
      if (color && color[3] === 0) continue
      return { node, style: style.outlineStyle, color, inset: parseFloat(style.outlineOffset) < 0 }
    }
    return null
  }

  let seen = new WeakSet<Element>()
  let last: Element | null = null

  return {
    async settle() {
      await document.fonts.ready
      // Let transitions finish (a button changing colour, the robot gliding) and check where they end up.
      const finite = document.getAnimations().filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime))
      await Promise.all(finite.map((animation) => animation.finished.catch(() => undefined)))
    },

    smallTargets(min: number) {
      const selector =
        'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], ' +
        '[role="checkbox"], [role="radio"], [role="switch"], [role="tab"], [tabindex]:not([tabindex="-1"])'
      return [...document.querySelectorAll(selector)].flatMap((el) => {
        if (!el.checkVisibility({ checkVisibilityCSS: true })) return []
        let box = el.getBoundingClientRect()
        if (box.width <= 1 || box.height <= 1) return [] // only there for screen readers
        // A radio button or checkbox can be clicked anywhere on its label.
        const label = el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox') ? el.labels?.[0] : null
        if (label) box = label.getBoundingClientRect()
        if (box.width >= min - 0.5 && box.height >= min - 0.5) return []
        return [`${describe(el)} is ${Math.round(box.width)}×${Math.round(box.height)}px`]
      })
    },

    startFocusWalk() {
      seen = new WeakSet()
      last = null
      // Smooth scrolling would still be on its way to each focused element when it's checked.
      // It ends up in the same place either way.
      document.documentElement.style.scrollBehavior = 'auto'
    },

    endFocusWalk() {
      document.documentElement.style.scrollBehavior = ''
    },

    checkFocus(): FocusStep {
      const el = document.activeElement
      if (!el || el === document.body) return { end: true }
      // Inside the preview of the learner's own web page: its focus styles are theirs.
      if (el.tagName === 'IFRAME') return { tag: el.tagName }
      const name = describe(el)
      if (el === last) return { stuck: name }
      last = el
      if (seen.has(el)) return { end: true } // back round to the start
      seen.add(el)

      const box = el.getBoundingClientRect()
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
      const label = el instanceof HTMLInputElement ? el.labels?.[0] : null
      if (!hit || !(el.contains(hit) || label?.contains(hit))) {
        return { tag: el.tagName, problem: `${name} can't be seen when it has focus${hit ? `: ${describe(hit)} is on top of it` : ''}` }
      }
      const ring = ringOf(el)
      if (!ring) return { tag: el.tagName, problem: `${name} has no focus ring` }
      if (ring.style !== 'auto' && ring.color) {
        const behind = backdrop(ring.inset ? ring.node : ring.node.parentElement)
        const ratio = contrast(over(ring.color, behind), behind)
        if (ratio < 3) return { tag: el.tagName, problem: `${name} has a focus ring with ${ratio.toFixed(2)}:1 contrast (needs 3:1)` }
      }
      return { tag: el.tagName }
    },

    reflow() {
      const width = document.documentElement.clientWidth
      const pageWidth = document.documentElement.scrollWidth
      if (pageWidth <= width) return []
      // Name the outermost things that stick out past the right edge.
      const sticking = [...document.body.querySelectorAll('*')].filter((el) => {
        const parent = el.parentElement
        return (
          el.getBoundingClientRect().right > width + 1 &&
          (!parent || (parent.getBoundingClientRect().right <= width + 1 && getComputedStyle(parent).overflowX === 'visible'))
        )
      })
      return [`The page is ${pageWidth}px wide, so it scrolls sideways. Sticking out: ${sticking.slice(0, 5).map(describe).join(', ')}`]
    },
  }
}
