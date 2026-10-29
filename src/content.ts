// All page wording lives here — edit freely. Colors live in tailwind.config.ts.
//
// `tone` picks a color family: 'violet' | 'green' | 'orange' | 'blue'.
// Icons come from lucide-react: find one at https://lucide.dev/icons, add it to the import below and use it.
import { Bot, BrainCircuit, Clock, CodeXml, Eye, Hand, ListChecks, Network, Signal, Zap } from 'lucide-react'

export const brand = {
  name: 'MindStack',
}

// Community and Sign in are left out until those pages exist.
export const nav = {
  links: [
    { label: 'Learn', href: '/learn' },
    { label: 'Projects', href: '/#featured' },
    { label: 'How it works', href: '/#how-it-works' },
  ],
  searchLabel: 'Search MindStack',
  searchPlaceholder: 'Search topics, projects…',
} as const

export const hero = {
  badge: 'Built for curious, restless minds',
  title: 'Learn Software Engineering, Computer Science, AI & Robotics',
  tagline: [
    { text: 'See it.', tone: 'violet' },
    { text: 'Do it.', tone: 'green' },
    { text: 'Build it.', tone: 'orange' },
  ],
  intro:
    'Visual lessons, hands-on projects and real-world skills — designed for ADHD minds, visual thinkers and kinesthetic learners.',
  primaryCta: { label: 'Start learning', href: '/#paths' },
  secondaryCta: { label: 'Try your first lesson', href: '/learn/computer-science/algorithms-are-recipes' },
  perks: ['10–15 min lessons', 'Code in your browser', 'No experience needed'],
} as const

// The interactive lesson card in the hero. The code it runs is in LessonPreview.tsx.
export const lessonPreview = {
  meta: 'Lesson 3 of 6 · Computer Science',
  progress: { current: 3, total: 6 },
  duration: '8 min',
  title: 'How a loop works',
  robotLabel: 'What the robot does',
  runButton: { start: 'Try it yourself', pause: 'Pause', resume: 'Resume', again: 'Run it again' },
  demo: { label: 'Watch 60-sec demo', href: '/learn/computer-science/how-a-loop-works' },
  status: {
    starting: 'Starting the loop…',
    running: (step: number) => `Running step ${step} of 4`,
    paused: (step: number) => `Paused at step ${step} of 4`,
    done: 'Done! Back where it started',
  },
  // Read out by screen readers when the demo starts, pauses and finishes.
  announcements: {
    running: 'Running the loop. The robot traces a square.',
    paused: 'Paused.',
    done: 'Done. Four moves and four turns put the robot back where it started.',
  },
} as const

export const learningPaths = {
  eyebrow: 'Learning paths',
  title: 'Find your path',
  subtitle: 'Pick a track and start building real skills — at your own pace.',
  paths: [
    {
      id: 'software-engineering',
      title: 'Software Engineering',
      description: 'Build real web apps, APIs and tools you can show off.',
      projects: '24 projects',
      icon: CodeXml,
      tone: 'violet',
    },
    {
      id: 'computer-science',
      title: 'Computer Science',
      description: 'See how computers think, solve problems and handle data.',
      projects: '18 projects',
      icon: Network,
      tone: 'green',
    },
    {
      id: 'ai',
      title: 'AI',
      description: 'Explore machine learning and neural networks by training your own.',
      projects: '15 projects',
      icon: BrainCircuit,
      tone: 'orange',
    },
    {
      id: 'robotics',
      title: 'Robotics',
      description: 'Build, program and control robots — real ones and simulations.',
      projects: '12 projects',
      icon: Bot,
      tone: 'blue',
    },
  ],
} as const

export const howItWorks = {
  eyebrow: 'How every lesson works',
  title: 'Three steps. Every time.',
  subtitle: 'Same rhythm in every lesson, so your brain knows what’s coming next.',
  // Keep this order: each step is paired with its mini visual (see, do, build).
  steps: [
    {
      title: 'See it',
      text: 'An animated diagram or 2-minute video shows the idea before any jargon.',
      tone: 'violet',
    },
    {
      title: 'Do it',
      text: 'Drag, tweak and run it yourself right away. Mistakes are instant feedback, not failure.',
      tone: 'green',
    },
    {
      title: 'Build it',
      text: 'Use what you learned in a mini-project you keep in your portfolio.',
      tone: 'orange',
    },
  ],
  speedDemo: {
    label: 'Robot speed',
    run: 'Run',
    hint: 'Drag the slider, then press Run.',
    result: (seconds: string, speed: number) => `Crossed in ${seconds}s at ${speed}% speed`,
  },
  buildDemo: {
    parts: ['Sensor', 'Logic'],
    result: 'Your robot',
  },
} as const

export const featuredProject = {
  eyebrow: 'Featured project',
  title: 'Build a line-following robot',
  text: 'Learn sensors, logic and control systems by building a robot that follows a line — in simulation first, then for real.',
  tags: [
    { label: '2–3 hours', icon: Clock },
    { label: 'Beginner', icon: Signal },
    { label: 'Hands-on', icon: Hand },
    { label: '7 bite-size steps', icon: ListChecks },
  ],
  cta: { label: 'View project', href: '/learn/robotics/follow-the-line' },
  playLabel: 'Play robot demo',
  pauseLabel: 'Pause robot demo',
} as const

export const fitsYou = {
  title: 'Learning that fits you',
  subtitle: 'Because everyone’s brain works differently.',
  traits: [
    {
      title: 'Visual first',
      text: 'Diagrams, animations and interactive simulations before walls of text.',
      tone: 'violet',
      icon: Eye,
    },
    {
      title: 'Learn by doing',
      text: 'Build, code and experiment in real time — within the first minute.',
      tone: 'green',
      icon: Hand,
    },
    {
      title: 'ADHD friendly',
      text: 'Short lessons, one clear goal per screen, and a calm, distraction-light design.',
      tone: 'orange',
      icon: Zap,
    },
  ],
} as const

export const momentum = {
  title: 'Keep momentum without the pressure',
  text: 'Focus mode hides everything but the task. A visual progress map shows how far you’ve come. Pick up exactly where you left off — no guilt streaks.',
  primaryCta: { label: 'Start for free', href: '/learn' },
  secondaryCta: { label: 'See focus mode', href: '/learn/computer-science/how-a-loop-works?focus=1' },
  map: {
    title: 'Your robotics map',
    summary: '5 of 9 done',
    // The dots are a window onto the 9-lesson map: lessons 3–5 done (1–2 are off to the left),
    // 6 in progress, 7 not started. Each stop is 'done', 'current' or 'todo'.
    firstLesson: 3,
    stops: ['done', 'done', 'done', 'current', 'todo'],
    upNext: {
      meta: 'Up next · 12 min',
      title: 'Reading a light sensor',
      cta: 'Continue',
      href: '/learn/robotics/reading-a-light-sensor',
    },
  },
} as const

export const footer = {
  links: [
    { label: 'About', href: '/about' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Help', href: '/help' },
    { label: 'Privacy', href: '/privacy' },
  ],
} as const

// ---------------------------------------------------------------- about, accessibility, help, privacy
// Each page is a title, an intro and a few sections. A section can have paragraphs (`text`),
// a list of points (`list`) and links shown under it (`links`).

export type InfoPageCopy = {
  title: string
  intro: string
  updated?: string
  sections: {
    heading: string
    text?: string[]
    list?: { lead: string; text: string }[]
    links?: { label: string; href: string }[]
  }[]
}

const github = 'https://github.com/Silicon-beep/mindstack'
const reportIssue = `${github}/issues/new`

export const infoPages: Record<'about' | 'accessibility' | 'help' | 'privacy', InfoPageCopy> = {
  about: {
    title: 'About MindStack',
    intro:
      'MindStack teaches Software Engineering, Computer Science, AI and Robotics to people who learn best by seeing and doing, especially ADHD minds, visual thinkers and kinesthetic learners.',
    sections: [
      {
        heading: 'Every lesson has the same three steps',
        text: ['The rhythm never changes, so your brain always knows what’s coming next.'],
        list: [
          { lead: 'See it', text: 'A short animated explanation shows the idea before any jargon.' },
          { lead: 'Do it', text: 'Try it straight away and get instant feedback. Mistakes are information, not failure.' },
          { lead: 'Build it', text: 'Use what you learned in a mini project that’s saved to your portfolio.' },
        ],
      },
      {
        heading: 'Built for brains that wander',
        text: [
          'Lessons take 10–15 minutes and show one clear goal per screen. Focus mode hides everything but the task. There are no streaks and no pressure: you pick up exactly where you left off.',
        ],
      },
      {
        heading: 'Where it’s at',
        text: [
          'MindStack is new. The first lessons are ready in all four paths, and more are on the way. It’s free, and you don’t need an account.',
        ],
        links: [
          { label: 'Start learning', href: '/learn' },
          { label: 'See the code on GitHub', href: github },
        ],
      },
    ],
  },
  accessibility: {
    title: 'Accessibility',
    intro:
      'MindStack is made for people whose brains work differently, so accessibility is part of the design, not an add-on. We aim to meet WCAG 2.2 at level AA.',
    updated: 'Last updated 29 October 2026',
    sections: [
      {
        heading: 'What’s built in',
        list: [
          {
            lead: 'Reduced motion',
            text: 'If your device is set to reduce motion, every animation switches off. The robot jumps from square to square instead of gliding.',
          },
          { lead: 'Focus mode', text: 'In a lesson, focus mode hides everything except the current task.' },
          { lead: 'One goal per screen', text: 'Every screen has a single task. Hints and solutions are always one tap away.' },
          {
            lead: 'Easy to see and tap',
            text: 'Text has a contrast of at least 4.5:1, and every button and link is at least 44 pixels tall.',
          },
          {
            lead: 'Keyboard and screen readers',
            text: 'A clear ring shows where keyboard focus is. Pages use headings and landmarks, icon buttons have labels, and the robot mat describes where the robot is. When you step through your code, a screen reader reads out what each line did. Moving to a new screen moves focus to its heading.',
          },
          { lead: 'No surprises', text: 'Nothing plays by itself, there are no popups, and nothing flashes.' },
        ],
      },
      {
        heading: 'Using the code editor with a keyboard',
        text: ['Tab indents your code. To leave the editor, press Esc, then Tab.'],
      },
      {
        heading: 'What we know isn’t perfect yet',
        text: [
          'MindStack hasn’t had an independent accessibility audit yet. The robot and neuron exercises are visual at heart. They describe what’s happening in text, but they may not work well with every screen reader yet.',
        ],
      },
      {
        heading: 'Tell us what gets in your way',
        text: [
          'If something on MindStack is hard to use, we want to know. Open an issue on GitHub and tell us which page you were on and what happened. You’ll need a free GitHub account.',
        ],
        links: [{ label: 'Report a barrier on GitHub', href: reportIssue }],
      },
    ],
  },
  help: {
    title: 'Help',
    intro: 'Quick answers to common questions.',
    sections: [
      {
        heading: 'Do I need to install anything?',
        text: ['No. Lessons, code and robots all run in your browser. You don’t need an account either.'],
      },
      {
        heading: 'Where is my progress saved?',
        text: [
          'In this browser, on this device. Because there are no accounts, your progress won’t follow you to another browser or device. Clearing your browser’s data for this site erases it.',
        ],
      },
      {
        heading: 'How do I start over?',
        text: [
          'Go to Your learning and choose Clear my progress at the bottom of the page. This removes your progress, code drafts and portfolio projects.',
        ],
        links: [{ label: 'Go to Your learning', href: '/learn' }],
      },
      {
        heading: 'I’m stuck on a lesson',
        text: [
          'Press Show a hint under the task. Show me a solution appears after the hint, and Start over puts the code back how it began. Using them costs nothing.',
        ],
      },
      {
        heading: 'How do I use focus mode?',
        text: [
          'In a lesson, press the Focus mode button at the top. It hides everything except the current task. Press it again to bring everything back.',
        ],
      },
      {
        heading: 'Can I use the code editor with a keyboard?',
        text: ['Yes. Tab indents your code. To leave the editor, press Esc, then Tab.'],
      },
      {
        heading: 'Something isn’t working',
        text: [
          'Open an issue on GitHub and tell us which page you were on and what happened. You’ll need a free GitHub account.',
        ],
        links: [{ label: 'Report a problem on GitHub', href: reportIssue }],
      },
    ],
  },
  privacy: {
    title: 'Privacy',
    intro: 'MindStack has no accounts, no ads and no tracking. Here’s exactly what happens to your data.',
    updated: 'Last updated 29 October 2026',
    sections: [
      {
        heading: 'What stays in your browser',
        text: [
          'Your progress, code drafts, portfolio projects and focus mode setting are saved in your browser’s local storage. They stay on your device: MindStack has no server to send them to.',
          'To delete them, choose Clear my progress on Your learning, or clear this site’s data in your browser.',
        ],
        links: [{ label: 'Go to Your learning', href: '/learn' }],
      },
      {
        heading: 'Cookies',
        text: ['MindStack doesn’t use cookies.'],
      },
      {
        heading: 'Services that see your visit',
        text: ['Two outside services are involved when you load MindStack:'],
        list: [
          {
            lead: 'GitHub Pages',
            text: 'GitHub hosts the site. It logs every visitor’s IP address for security purposes.',
          },
          {
            lead: 'Google Fonts',
            text: 'Google supplies the Lexend font. When it loads, Google receives your IP address and the font request. Google Fonts doesn’t set cookies.',
          },
        ],
        links: [
          {
            label: 'GitHub’s privacy statement',
            href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
          },
          { label: 'Google Fonts privacy FAQ', href: 'https://developers.google.com/fonts/faq/privacy' },
        ],
      },
      {
        heading: 'Questions',
        text: [
          'Open an issue on GitHub. Anything you write there is public, and GitHub’s privacy statement applies to it.',
        ],
        links: [{ label: 'Ask on GitHub', href: reportIssue }],
      },
    ],
  },
}

// ---------------------------------------------------------------- learning pages
// Lesson content itself (explanations, code, challenges) lives in src/learn/lessons/.

export const learnUi = {
  dashboard: {
    title: 'Your learning',
    intro: 'Everything you do saves in this browser. No streaks and no pressure: pick up whenever you like.',
    continueEyebrow: 'Pick up where you left off',
    continue: 'Continue',
    startTitle: 'Start your first lesson',
    startText: 'Lessons take 10–15 minutes and need no experience. Algorithms are recipes is a good first one, or pick any path below.',
    startLesson: 'Start learning',
    startHref: '/learn/computer-science/algorithms-are-recipes',
    pathsTitle: 'Your paths',
    portfolioTitle: 'Your portfolio',
    portfolioEmpty: 'Finish the Build it step of any lesson and your project lands here.',
    openLesson: 'Open lesson',
    reset: 'Clear my progress',
    resetConfirm: 'Clear all progress, drafts and projects? This can’t be undone.',
    resetYes: 'Yes, clear it',
    resetNo: 'Keep it',
  },
  path: {
    back: 'All paths',
    lessonsDone: (done: number, total: number) => `${done} of ${total} lessons done`,
    lessonMeta: (n: number, minutes: number) => `Lesson ${n} · ${minutes} min`,
    start: 'Start',
    continue: 'Continue',
    review: 'Review',
    comingSoon: 'Coming soon',
    startPath: 'Start the first lesson',
    continuePath: 'Continue where you left off',
    nextPath: 'Start the next lesson',
    allDone: 'You’ve finished every lesson so far. New ones are on the way.',
  },
  lesson: {
    stages: { see: 'See it', do: 'Do it', build: 'Build it' },
    lessonOf: (n: number, total: number) => `Lesson ${n} of ${total}`,
    goal: 'Goal',
    back: 'Back',
    next: 'Next',
    nextStage: (stage: string) => `Next: ${stage}`,
    finish: 'Finish lesson',
    locked: 'Finish this step to continue',
    focusOn: 'Focus mode',
    focusOff: 'Exit focus',
    completeTitle: 'Lesson complete',
    completeText: 'You can now:',
    savedBuild: 'Your Build it project is saved in your portfolio.',
    nextLesson: 'Next lesson',
    backToPath: (title: string) => `Back to ${title}`,
    review: 'Go through it again',
  },
  exercise: {
    run: 'Run',
    runAgain: 'Run again',
    pause: 'Pause',
    resume: 'Resume',
    step: 'Step',
    reset: 'Reset',
    chips: 'Tap to add a line',
    editorLabel: 'Your code',
    editorKeys: 'Tab indents. Press Esc, then Tab, to leave the editor.',
    sensor: 'Light sensor',
    dark: 'dark tape',
    bright: 'bright floor',
    console: 'Printed output',
    consoleEmpty: 'Nothing printed yet.',
    // Where the robot is: the mat's description, and part of what screen readers hear at each Step.
    robotAt: (column: number, row: number, facing: string) => `Robot at column ${column}, row ${row}, facing ${facing}.`,
    // Read out to screen readers. Step and Pause say what just happened; while running it only says so.
    announceRunning: 'Running your code.',
    announceReady: 'Ready to step through your code.',
    announceStep: (step: number, steps: number, line: number, code: string) => `Step ${step} of ${steps}: line ${line}, ${code}.`,
    announceStar: (left: number, total: number) => `Picked up a star. ${left} of ${total} left.`,
    announcePrint: (value: string) => `Printed ${value}.`,
    announceSensor: (reading: number, surface: string) => `Light sensor reads ${reading}, ${surface}.`,
    showHint: 'Show a hint',
    hideHint: 'Hide hint',
    showSolution: 'Show me a solution',
    startOver: 'Start over',
    preview: 'Preview',
    checklist: 'Checklist',
    checksDone: (done: number, total: number) => `${done} of ${total} done`,
    webSolved: 'Everything on the checklist is done. Nice work!',
    correctCount: (correct: number, total: number) => `${correct} of ${total} sorted correctly`,
    train: 'Train on one example',
    trainMany: 'Train 5 times',
    neuronSolved: 'Every example is sorted correctly.',
    trainDone: 'Training is done. The neuron sorts every example correctly.',
    trainNote: (guess: string, actual: string) =>
      `It said “${guess}” for an example that was “${actual}”, so it nudged its weights toward the right answer.`,
    legend: 'Shaded areas show what the neuron would answer for any point.',
  },
  search: {
    title: 'Search',
    label: 'Search topics and lessons',
    submit: 'Search',
    resultsFor: (count: number, query: string) => `${count} result${count === 1 ? '' : 's'} for “${query}”`,
    none: 'Nothing matches that yet. Try a shorter word, like “loop”, “sensor” or “CSS”.',
    empty: 'Type a topic above, like loops, sensors, HTML or neurons.',
  },
  notFound: {
    title: 'This page isn’t built yet',
    text: 'It’s on the list. Your progress is safe in this browser.',
    home: 'Go to the homepage',
    learn: 'Go to your learning',
  },
} as const
