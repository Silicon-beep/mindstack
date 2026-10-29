import { expect, test } from '@playwright/test'
import { learnUi } from '../src/content'
import { checkAccessibility } from './checks'
import { pages, partWay, seed } from './site'

for (const { name, url, progress } of pages) {
  test(name, async ({ page }) => {
    if (progress) await seed(page, progress)
    await page.goto(url)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await checkAccessibility(page, 'as it loads')
  })
}

test('Your learning, asking before clearing progress', async ({ page }) => {
  const copy = learnUi.dashboard
  await seed(page, partWay)
  await page.goto('/learn')
  await page.getByRole('button', { name: copy.reset }).click()
  await expect(page.getByRole('button', { name: copy.resetYes })).toBeVisible()
  await checkAccessibility(page, 'with the question showing', { keyboard: false })
})

test('Phone menu, open', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'The menu button only shows on small screens')
  await page.goto('/')
  await page.getByRole('button', { name: 'Main menu' }).click()
  await checkAccessibility(page, 'with the menu open')
})
