# MindStack

A learning platform for Software Engineering, Computer Science, AI and Robotics, designed for ADHD minds, visual thinkers and kinesthetic learners. Every lesson follows the same rhythm: **See it** (a short animated explanation), **Do it** (try it straight away, with instant feedback) and **Build it** (a mini project that's saved to your portfolio).

Built with React, Vite, TypeScript, Tailwind CSS and React Router.

## Run it

You need Node.js 22.22 or newer.

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm test          # run the code-engine and lesson tests
npm run test:a11y # run the accessibility checks in Chrome (about 2 minutes)
npm run build     # type-check, then build to dist/
npm run preview   # serve the built site locally
npm run deploy    # publish to GitHub Pages
```

### Put it online

The live site is at **https://silicon-beep.github.io/mindstack/**, served by GitHub Pages from the `gh-pages` branch. To publish your latest changes, run `npm run deploy`. It builds the site and pushes the result to `gh-pages`, and the new version shows up a minute or two later.

The site is built for the `/mindstack/` address. If you rename the repo, change `BASE` in `scripts/deploy-pages.sh` to match, and the preview-card addresses in `index.html`.

### Preview card

When someone shares a MindStack link, chat apps and social sites show a title, a description and a picture. The tags are in `index.html`, and the picture is `public/og-image.png` (1200×630). To change the picture, edit `scripts/og-image.html` and run the Chrome command at the top of that file.

## What's in it

| Page | Address | What it does |
| --- | --- | --- |
| Home | `/` | The marketing homepage |
| Your learning | `/learn` | Pick up where you left off, progress for each path, and your portfolio of builds |
| Path | `/paths/computer-science` | The path's lesson map: what's done, what's next, what's coming soon |
| Lesson | `/learn/computer-science/how-a-loop-works` | The lesson player, with focus mode |
| Search | `/search?q=loop` | Finds lessons by title, goal or topic |
| About, Accessibility, Help, Privacy | `/about`, `/accessibility`, `/help`, `/privacy` | Short info pages linked from the footer. Their wording is `infoPages` in `content.ts` |

Progress, code drafts and portfolio builds are saved in the browser (localStorage). There are no accounts yet and no streaks. "Clear my progress" at the bottom of `/learn` resets everything.

### Lessons so far

- **Computer Science:** Algorithms are recipes, Find the bug, How a loop works, Making decisions, Loops that wait
- **Robotics:** Reading a light sensor, Follow the line
- **Software Engineering:** What a web page is made of, Style it with CSS
- **AI:** Teach a neuron, Why training data matters

Each path also lists its next few lessons as "Coming soon".

## Change the text

- **Homepage and page text** (buttons, headings, messages) is in **`src/content.ts`**.
- **Lesson content** (explanations, questions, code challenges) is in **`src/learn/lessons/`**, one file per path.
- **Which lessons are in each path, and in what order**, is in **`src/learn/catalog.ts`**.

In `content.ts`, `href` sets where a link goes and `tone` picks a color family (`'violet'`, `'green'`, `'orange'` or `'blue'`). `icon` takes any icon from [lucide.dev/icons](https://lucide.dev/icons): add it to the import at the top of the file, then use it.

## Add a lesson

A lesson is a list of screens. Each screen has a `stage` (`'see'`, `'do'` or `'build'`) and a `kind`:

| Kind | Use it for |
| --- | --- |
| `explain` | See it: a few short parts, each with a title, a sentence or two, and a visual |
| `predict` | "What will happen?" with multiple choice. Every answer explains itself. |
| `robot` | Write Python-style code that drives a robot on a grid |
| `web` | Write HTML and CSS with a live preview and a checklist that ticks itself off |
| `neuron` | Tune a neuron with sliders, or press Train and watch it learn |

To add one, copy a lesson object in `src/learn/lessons/`, change it, and put it in its path's list in `catalog.ts`, replacing a `soon(...)` entry if there is one. Then run `npm test`: it checks that every robot challenge can be solved by its own solution and that its starter code doesn't already pass. `npm run test:a11y` then checks each screen of the new lesson for accessibility.

Real-world facts in lessons (how a sensor works, what a term means, any number or date) need a reliable source. `src/learn/lessons/SOURCES.md` lists the source for every fact the lessons state, so add yours there.

### Robot mats and code

Mats are drawn with characters, one per square: `.` floor, `#` wall, `=` dark tape, `*` star, `G` flag, and `^ > v <` for the robot and the way it faces.

The robot understands a small, friendly part of Python:

```python
robot.move()          # one square forward (robot.move(3) for three)
robot.turn_left()     # or robot.turn_right(), robot.turn(90), robot.turn(-90)
for i in range(4):    # loops
while not robot.at_goal():
if robot.front_is_clear():   # if / elif / else
print(robot.light())  # 12 on dark tape, 88 on bright floor
```

Sensors: `light()`, `on_line()`, `front_is_clear()`, `at_goal()`, `line_ahead()`, `line_left()`, `line_right()`.

Mistakes come back as plain-language messages with a line number, like "Line 2: The robot doesn't know “mvoe”. Did you mean robot.move()?" The engine is in `src/learn/robot/`. Ready-made success checks (reach the flag, collect every star, use a loop, and so on) are in `checks.ts`.

## Change the colors

Colors, corner radii, shadows, fonts and the page width are design tokens in **`tailwind.config.ts`**. Change a hex value there and every component that uses it updates.

These tokens replace Tailwind's built-in palette, so only MindStack colors exist. Use classes like `bg-violet-tint`, `text-muted` or `border-line`. Tailwind's default `gray-500` and similar don't exist here.

Keep contrast in mind when you change colors. Text needs at least 4.5:1 against its background (3:1 for text 24px and larger). The current green `#0A8F65` and orange `#D9480F` only pass at large sizes, so small text and the lesson stage badges use their `-dark` versions.

Other places that control the look:

- **Buttons and focus rings:** `src/index.css` (`.btn-dark`, `.btn-outline`, `.btn-link`, …)
- **Which classes each tone uses:** `src/lib/tones.ts`
- **Font:** the Lexend link in `index.html`, plus `fontFamily` in `tailwind.config.ts`

## Project layout

```
src/
  content.ts          homepage and page text
  App.tsx             routes
  pages/              one file per page (Home, Learn, Path, Lesson, Search, Info, Not found)
  components/         homepage sections, navbar, footer
  learn/
    catalog.ts        which lessons are in each path
    lessons/          the lessons themselves
    components/       lesson widgets: code editor, robot mat, web preview, neuron, …
    robot/            the robot's world, interpreter and success checks
    progress.ts       saved progress (localStorage)
  lib/                tones and small helpers
  index.css           base styles, focus rings, buttons, reduced-motion rules
tailwind.config.ts    design tokens
a11y/                 the accessibility checks (Playwright and axe)
```

## Accessibility

- **Reduced motion:** if a visitor's system asks for less motion, `src/index.css` switches off every transition and animation. The robot then jumps from square to square instead of gliding, and nothing else moves.
- **Focus mode:** in a lesson, focus mode hides everything but the current task.
- **One goal per screen:** every screen shows a single task. Next stays locked until that task is done, and hints and solutions are always one tap away.
- **Contrast, targets, focus:** text meets WCAG AA contrast. Every button and link is at least 44px tall and shows a visible focus ring. Moving to a new screen moves keyboard focus to its heading.
- **Markup:** the page uses semantic landmarks (`header`, `nav`, `main`, `section`, `footer`). Icon-only buttons have an `aria-label`, decorative SVGs are hidden from screen readers, and the robot mat describes where the robot is. Pressing Step reads out what each line did and where the robot ended up.
- **No surprises:** nothing autoplays, there are no popups, and nothing flashes.

### Automated checks

`npm run test:a11y` builds the site, opens it in Chrome at desktop size and at phone size, and checks every page and every lesson screen:

- **axe** runs the WCAG 2.2 A and AA rules plus its best practices. In lessons it runs in every state a learner can reach: hint showing, a wrong answer, code part-way through running, solved, and lesson complete.
- **Targets:** every link, button and field is at least 44×44px.
- **Keyboard:** Tab reaches every control. Each one shows a focus ring with 3:1 contrast that nothing covers, not even the sticky lesson footer. Esc then Tab leaves the code editor.
- **Phone widths:** nothing scrolls sideways at 320px wide.
- **Motion:** with reduced motion on, nothing glides. With it off, nothing moves or pops up until you press something.
- **Focus moves where it should:** Skip to content works, Escape closes the phone menu, and opening a page or lesson screen puts focus at its start.

New lessons are checked automatically, because the checks read `catalog.ts`. A new page needs adding to `pages` in `a11y/site.ts`.

When a check fails, the message names the element and the problem. `npx playwright show-report` opens the full report, including a step-by-step trace of each failure. On a new computer, run `npx playwright install chromium` once first. GitHub runs the same checks on every push (`.github/workflows/checks.yml`).

Automated checks can't judge everything. Whether the wording is clear, or a screen reader reads things in a sensible order, still needs a person to try it.
