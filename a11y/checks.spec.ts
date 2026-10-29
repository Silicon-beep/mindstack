// The checks are only useful if they fail when something's wrong, so this page breaks each rule once.
import { expect, test } from '@playwright/test'
import { findProblems } from './checks'

const BROKEN = `<!doctype html>
<html lang="en">
  <head>
    <title>Broken on purpose</title>
    <style>
      body { margin: 0; font: 16px/1.6 sans-serif; }
      :focus-visible { outline: 3px solid #5b4be0; outline-offset: 3px; }
      button, a { display: inline-block; min-width: 44px; min-height: 44px; }
      .no-ring:focus-visible { outline: none; }
      .faint-ring:focus-visible { outline-color: #eeeeee; }
      .cover { position: fixed; left: 0; right: 0; bottom: 0; height: 120px; background: #ffffff; }
      .covered { position: fixed; left: 0; bottom: 20px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Broken on purpose</h1>
      <p style="color: #aaaaaa">Pale text</p>
      <button style="min-width: 0; min-height: 0; width: 30px; height: 30px">Tiny</button>
      <button class="no-ring">No ring</button>
      <a href="https://example.com/" class="faint-ring">Faint ring</a>
      <button class="covered">Covered</button>
      <div style="width: 600px">Too wide</div>
      <label>Trap <textarea id="trap" style="width: 200px; height: 88px"></textarea></label>
    </main>
    <div class="cover"></div>
    <script>
      document.getElementById('trap').addEventListener('keydown', (event) => event.key === 'Tab' && event.preventDefault())
    </script>
  </body>
</html>`

test('The checks catch what they look for', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Once is enough')
  await page.setContent(BROKEN)
  const problems = await findProblems(page, { phone: true })
  expect(problems.axe).toEqual([expect.stringMatching(/^color-contrast: <p .*Pale text/)])
  expect(problems.targets).toEqual(['<button> “Tiny” is 30×30px'])
  expect(problems.keyboard).toEqual([
    '<button> “No ring” has no focus ring',
    expect.stringMatching(/^<a> “Faint ring” has a focus ring with 1\.\d+:1 contrast \(needs 3:1\)$/),
    expect.stringMatching(/^<button> “Covered” can't be seen when it has focus: <div class="cover"> is on top of it$/),
    "Esc then Tab doesn't leave <textarea> “Trap”",
  ])
  expect(problems.reflow).toEqual([expect.stringMatching(/^The page is \d+px wide, so it scrolls sideways\. Sticking out: <div> “Too wide”/)])
})
