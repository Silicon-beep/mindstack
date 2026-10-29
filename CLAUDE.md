# MindStack: working rules for Claude

Read README.md first for the project layout, where text and colors live, and how lessons work.

## Use live sources, not memory

- **Library code:** before writing or changing code that uses React, React Router, Vite, Tailwind, Vitest, Playwright, axe or lucide-react, look up the current docs with the Context7 MCP tools for the version in `package.json`. If Context7 isn't connected or is down, use web search and the library's official docs instead. Don't write library APIs from memory.
- **Lesson facts:** before a lesson states a real-world fact (how a sensor works, an AI or CS concept, a number, a date), check it with web search, and add the source to `src/learn/lessons/SOURCES.md`.
- **Dependencies:** when adding or upgrading one, check its latest release and use a version that's been out for at least 2 weeks.

## Project rules

- **Text:** page wording goes in `src/content.ts`. Lesson content goes in `src/learn/lessons/`.
- **Colors:** use only the tokens in `tailwind.config.ts`. Small text uses the `-dark` green and orange.
- **Accessibility:** 4.5:1 contrast, 44px targets, visible focus rings, reduced motion turns animation off, and no popups, autoplay or flashing.
- **No quizzes:** this is a learning and teaching platform.
- **Checks:** run `npm test`, `npm run build` and `npm run test:a11y` before committing. When an accessibility check fails, fix the site, not the check. New pages go in `pages` in `a11y/site.ts`.
- **Publishing:** `npm run deploy` publishes to https://silicon-beep.github.io/mindstack/
