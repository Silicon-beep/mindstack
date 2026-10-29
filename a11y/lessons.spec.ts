// Every screen of every lesson, in each state a learner can reach: hints showing, a wrong answer,
// code part-way through running, a failed run, solved, and the lesson-complete screen.
import type { Page } from '@playwright/test'
import { learnUi } from '../src/content'
import type { Screen } from '../src/learn/types'
import { checkAccessibility } from './checks'
import { expect, test } from './fixtures'
import { atScreen, lessons, nextButton, seed } from './site'

const copy = learnUi.lesson
const exercise = learnUi.exercise
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

for (const { path, lesson, key, url } of lessons) {
  test.describe(`${path.title}: ${lesson.title}`, () => {
    lesson.screens.forEach((screen, index) => {
      test(`${index + 1}. ${copy.stages[screen.stage]}: ${screen.title}`, async ({ page }) => {
        await seed(page, atScreen(key, index))
        await page.goto(url)
        await expect(page.getByRole('heading', { level: 1, name: screen.title, exact: true })).toBeVisible()
        await checkAccessibility(page, 'as it opens')
        await tryEachState(page, screen)

        if (index === lesson.screens.length - 1) {
          await nextButton(page).click()
          await expect(page.getByRole('heading', { level: 1, name: copy.completeTitle })).toBeFocused()
          await checkAccessibility(page, 'lesson complete')
        }
      })
    })
  })
}

// Works through the screen the way a learner would, checking along the way. Every screen ends solved.
async function tryEachState(page: Page, screen: Screen) {
  const after = (state: string) => checkAccessibility(page, state, { keyboard: false })
  switch (screen.kind) {
    case 'explain':
      for (let part = 1; part < screen.frames.length; part++) {
        await nextButton(page).click()
        await expect(page.getByRole('heading', { level: 2, name: screen.frames[part].title, exact: true })).toBeVisible()
        await after(`part ${part + 1}`)
      }
      await button(page, copy.focusOn).click()
      await after('in focus mode')
      return

    case 'predict': {
      const wrong = screen.options.find((option) => !option.correct)
      if (wrong) {
        await page.getByRole('radio', { name: wrong.text, exact: true }).check()
        await after('after a wrong answer')
      }
      const right = screen.options.find((option) => option.correct)
      if (!right) throw new Error(`“${screen.title}” has no right answer`)
      await page.getByRole('radio', { name: right.text, exact: true }).check()
      await expect(nextButton(page)).toBeEnabled()
      await after('after the right answer')
      return
    }

    case 'robot':
      await button(page, exercise.showHint).click()
      await after('with the hint showing')
      await button(page, exercise.step).click()
      await after('paused part-way through a run')
      await stepToEnd(page)
      await after('after running the starter code')
      await button(page, exercise.showSolution).click()
      await stepToEnd(page)
      await expect(nextButton(page)).toBeEnabled()
      await after('solved')
      return

    case 'web':
      await button(page, exercise.showHint).click()
      await after('with the hint showing')
      await button(page, exercise.showSolution).click()
      await expect(nextButton(page)).toBeEnabled()
      await after('solved')
      return

    case 'neuron':
      await button(page, exercise.showHint).click()
      await after('with the hint showing')
      if (screen.task.mode === 'train') {
        await button(page, exercise.train).click()
        await after('after one training step')
      }
      await button(page, exercise.showSolution).click()
      await expect(nextButton(page)).toBeEnabled()
      await after('solved')
      return

    case 'network':
    case 'doodle':
      await button(page, exercise.showHint).click()
      await after('with the hint showing')
      await button(page, exercise.showSolution).click()
      await expect(nextButton(page)).toBeEnabled()
      await after('solved')
  }
}

// Steps through the robot's program one move at a time, which is quicker than watching it run.
async function stepToEnd(page: Page) {
  const runAgain = button(page, exercise.runAgain)
  for (let steps = 0; steps < 500 && !(await runAgain.isVisible()); steps++) await button(page, exercise.step).click()
  await expect(runAgain).toBeVisible()
}
