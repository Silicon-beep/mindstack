// Shared setup for every check. Pages load the Lexend font from Google Fonts, and each test starts with an
// empty browser cache, so a full run would send Google hundreds of identical requests, and one stalled
// request is enough to time out a check. Instead, each test worker downloads each font file once and reuses it.
import { test as base, type Route } from '@playwright/test'

type Saved = { status: number; headers: Record<string, string>; body: Buffer }
const fonts = new Map<string, Promise<Saved>>()

async function download(route: Route): Promise<Saved> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await route.fetch({ timeout: 10_000 })
      return { status: response.status(), headers: response.headers(), body: await response.body() }
    } catch (error) {
      if (attempt === 3) throw error
    }
  }
}

export const test = base.extend<{ fontCache: void }>({
  fontCache: [
    async ({ context }, use, testInfo) => {
      await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, async (route) => {
        const url = route.request().url()
        let saved = fonts.get(url)
        if (!saved) {
          saved = download(route)
          fonts.set(url, saved)
        }
        try {
          await route.fulfill(await saved)
        } catch {
          fonts.delete(url)
          testInfo.annotations.push({ type: 'warning', description: `Couldn't load ${url}, so this page was checked with a fallback font.` })
          await route.abort().catch(() => undefined)
        }
      })
      await use()
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
