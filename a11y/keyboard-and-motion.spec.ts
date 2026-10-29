import type { Page } from '@playwright/test'
import { featuredProject, footer, learnUi, lessonPreview } from '../src/content'
import { run } from '../src/learn/robot/interpreter'
import { DIRECTION_NAMES } from '../src/learn/robot/world'
import { expect, test } from './fixtures'
import { atScreen, lessons, nextButton, pages, seed } from './site'

declare global {
  interface Window {
    animationFrames: number
  }
}

test.describe('Keyboard', () => {
  test('Skip to content jumps past the header', async ({ page }) => {
    for (const url of ['/', lessons[0].url]) {
      await page.goto(url)
      await page.keyboard.press('Tab')
      const skip = page.getByRole('link', { name: 'Skip to content' })
      await expect(skip).toBeFocused()
      await expect(skip).toBeInViewport()
      await page.keyboard.press('Enter')
      await page.keyboard.press('Tab')
      const pastHeader = await page.evaluate(() => {
        const main = document.getElementById('main')
        const focused = document.activeElement
        if (!main || !focused) return false
        return main.contains(focused) || Boolean(main.compareDocumentPosition(focused) & Node.DOCUMENT_POSITION_FOLLOWING)
      })
      expect(pastHeader, `On ${url}, the next Tab should land in the page, not the header`).toBe(true)
    }
  })

  test('Escape closes the phone menu and puts focus back on its button', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The menu button only shows on small screens')
    await page.goto('/')
    const menu = page.getByRole('button', { name: 'Main menu' })
    await menu.click()
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Escape')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(menu).toBeFocused()
  })

  test('Opening another page puts focus at the start of it', async ({ page }) => {
    const link = footer.links[0]
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name: link.label }).click()
    await expect(page).toHaveURL(new RegExp(`${link.href}$`))
    await expect(page.locator('#main')).toBeFocused()
  })

  test('You can draw a doodle with the keyboard', async ({ page }) => {
    const doodle = lessons.flatMap(({ key, url, lesson }) =>
      lesson.screens.flatMap((screen, index) => (screen.kind === 'doodle' ? [{ key, url, index }] : [])),
    )[0]
    await seed(page, atScreen(doodle.key, doodle.index))
    await page.goto(doodle.url)
    const grid = page.getByRole('group', { name: learnUi.exercise.doodleGrid })
    const square = (row: number, col: number) => grid.getByRole('button', { name: learnUi.exercise.doodleCell(row, col), exact: true })
    await square(1, 1).focus()
    await page.keyboard.press('Space')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Space')
    await expect(square(2, 1)).toBeFocused()
    await expect(square(1, 1)).toHaveAttribute('aria-pressed', 'true')
    await expect(square(2, 1)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText(learnUi.exercise.doodleClues(1, 2))).toBeVisible()
  })

  test('A new lesson screen puts focus on its heading', async ({ page }) => {
    const { url, lesson } = lessons[0]
    const [first, second] = lesson.screens
    await page.goto(url)
    const presses = first.kind === 'explain' ? first.frames.length : 1
    for (let i = 0; i < presses; i++) await nextButton(page).click()
    await expect(page.getByRole('heading', { level: 1, name: second.title, exact: true })).toBeFocused()
  })
})

test.describe('Screen readers', () => {
  test('Step reads out what each line did', async ({ page }) => {
    const copy = learnUi.exercise
    // The first robot exercise whose starter code moves the robot at least once.
    const target = lessons
      .flatMap(({ key, url, lesson }) => lesson.screens.map((screen, index) => ({ key, url, index, screen })))
      .flatMap((s) => (s.screen.kind === 'robot' ? [{ ...s, task: s.screen.task }] : []))
      .find(({ task }) => run(task.starter, task.world).frames.length > 1)
    if (!target) throw new Error('No robot exercise to step through')
    const steps = run(target.task.starter, target.task.world).frames
    const first = steps[1]
    const firstLine = target.task.starter.split('\n')[first.line - 1].trim()

    await seed(page, atScreen(target.key, target.index))
    await page.goto(target.url)
    const status = page.getByRole('status')
    const step = page.getByRole('button', { name: copy.step, exact: true })
    await step.click()
    await expect(status).toContainText(copy.announceReady)
    await step.click()
    await expect(status).toContainText(copy.announceStep(1, steps.length - 1, first.line, firstLine))
    await expect(status).toContainText(copy.robotAt(first.robot.x + 1, first.robot.y + 1, DIRECTION_NAMES[first.robot.dir]))
  })
})

test.describe('Motion', () => {
  test.skip(({ isMobile }) => isMobile, 'Motion works the same at every screen size')

  // JavaScript animations move things one animation frame at a time, so count the frames.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.animationFrames = 0
      const request = window.requestAnimationFrame.bind(window)
      window.requestAnimationFrame = (callback) => {
        window.animationFrames++
        return request(callback)
      }
    })
  })

  test('With reduced motion on, nothing glides', async ({ page }) => {
    await page.goto('/')
    // With motion allowed, the featured robot glides along its line. This also shows the frame counter works.
    await page.getByRole('button', { name: featuredProject.playLabel }).click()
    expect(await framesDuring(page, 500)).toBeGreaterThan(5)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()
    await page.getByRole('button', { name: featuredProject.playLabel }).click()
    await page.getByRole('button', { name: lessonPreview.runButton.start }).click()
    expect(await framesDuring(page, 1000), 'animation frames on the homepage').toBe(0)
    expect(await stillMoving(page), 'on the homepage').toEqual([])

    const robot = lessons.flatMap(({ key, url, lesson }) =>
      lesson.screens.flatMap((screen, index) => (screen.kind === 'robot' ? [{ key, url, index }] : [])),
    )[0]
    await seed(page, atScreen(robot.key, robot.index))
    await page.goto(robot.url)
    await page.getByRole('button', { name: learnUi.exercise.run, exact: true }).click()
    expect(await framesDuring(page, 1000), 'animation frames in a robot lesson').toBe(0)
    expect(await stillMoving(page), 'in a robot lesson').toEqual([])
  })

  const urls = [...new Set([...pages.map((page) => page.url), ...lessons.map((lesson) => lesson.url)])]
  for (const url of urls) {
    test(`Nothing moves or pops up by itself: ${url}`, async ({ page }) => {
      const popups: string[] = []
      page.on('dialog', (dialog) => {
        popups.push(`${dialog.type()}: ${dialog.message()}`)
        void dialog.dismiss()
      })
      page.on('popup', (popup) => popups.push(`new window: ${popup.url()}`))
      await page.goto(url)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      const activity = await page.evaluate(async () => {
        const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
        await wait(300) // let the first render settle
        let changes = 0
        const observer = new MutationObserver((records) => (changes += records.length))
        observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true })
        const frames = window.animationFrames
        await wait(1500)
        observer.disconnect()
        return {
          'changes to the page': changes,
          'animation frames': window.animationFrames - frames,
          'running animations': document.getAnimations().filter((animation) => animation.playState === 'running').length,
        }
      })
      expect(activity).toEqual({ 'changes to the page': 0, 'animation frames': 0, 'running animations': 0 })
      expect(popups).toEqual([])
      await expect(page.locator('video[autoplay], audio[autoplay]')).toHaveCount(0)
    })
  }
})

const framesDuring = (page: Page, ms: number) =>
  page.evaluate(async (ms) => {
    const before = window.animationFrames
    await new Promise((resolve) => setTimeout(resolve, ms))
    return window.animationFrames - before
  }, ms)

// Anything still set to animate or transition for longer than a blink. The reduced-motion rule in
// index.css cuts every one to 0.01ms.
const stillMoving = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('*')].flatMap((el) => {
      const style = getComputedStyle(el)
      const longest = (list: string) => Math.max(...list.split(',').map((t) => parseFloat(t) * (t.trim().endsWith('ms') ? 1 : 1000)))
      const ms = Math.max(longest(style.transitionDuration), style.animationName === 'none' ? 0 : longest(style.animationDuration))
      return ms > 1 ? [`<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}"> moves for ${ms}ms`] : []
    }),
  )
