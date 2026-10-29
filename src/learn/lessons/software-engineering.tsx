import type { ReactNode } from 'react'
import { CodeBlock, Pair } from '../components/visuals'
import type { Lesson } from '../types'

// ---------------------------------------------------------------- visuals

function Labelled({ label, children, tone }: { label: string; children: ReactNode; tone: string }) {
  return (
    <span className="flex flex-col items-center gap-2">
      <span className={`rounded-xl px-3 py-2 font-mono text-lg font-semibold sm:text-xl ${tone}`}>{children}</span>
      <span className="text-sm font-semibold text-violet-dark">{label}</span>
    </span>
  )
}

function TagAnatomy() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-2">
      <Labelled label="opening tag" tone="bg-white text-blue">{'<h1>'}</Labelled>
      <Labelled label="content" tone="bg-white text-ink">Hello!</Labelled>
      <Labelled label="closing tag" tone="bg-white text-blue">{'</h1>'}</Labelled>
    </div>
  )
}

function Box({ tag, children }: { tag: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-violet bg-white p-3">
      <span className="font-mono text-sm font-semibold text-violet-dark">{`<${tag}>`}</span>
      {children && <div className="mt-2 flex flex-col gap-2">{children}</div>}
    </div>
  )
}

function NestedBoxes() {
  return (
    <div className="w-full max-w-sm">
      <Box tag="body">
        <Box tag="h1" />
        <Box tag="p" />
        <Box tag="ul">
          <div className="grid grid-cols-2 gap-2">
            <Box tag="li" />
            <Box tag="li" />
          </div>
        </Box>
      </Box>
    </div>
  )
}

function BrowserCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div aria-hidden="true" className="flex gap-1.5 border-b border-line bg-canvas px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

const pageCode = '<h1>Hi, I’m Sam</h1>\n<p>I build robots.</p>\n<ul>\n  <li>Line follower</li>\n  <li>Robot arm</li>\n</ul>'

function CodeAndPage() {
  return (
    <Pair>
      <CodeBlock code={pageCode} language="html" />
      <BrowserCard>
        <p className="text-2xl font-bold">Hi, I’m Sam</p>
        <p className="mt-2">I build robots.</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Line follower</li>
          <li>Robot arm</li>
        </ul>
      </BrowserCard>
    </Pair>
  )
}

function RuleAnatomy() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-2">
      <Labelled label="selector" tone="bg-white text-blue">h1</Labelled>
      <Labelled label="property" tone="bg-white text-violet-dark">color:</Labelled>
      <Labelled label="value" tone="bg-white text-green-dark">purple;</Labelled>
    </div>
  )
}

function OneRuleMany() {
  return (
    <Pair>
      <CodeBlock code={'p {\n  color: teal;\n}'} language="html" />
      <BrowserCard>
        <div className="space-y-2 text-green-dark">
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <p>Third paragraph</p>
        </div>
      </BrowserCard>
    </Pair>
  )
}

function BoxModel() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border-[3px] border-ink bg-white p-6">
        <div className="rounded-lg border-2 border-dashed border-violet bg-violet-icon/40 p-6">
          <span className="rounded-md bg-white px-3 py-2 font-semibold">Content</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-violet-dark">dashed area = padding · dark edge = border</p>
    </div>
  )
}

// ---------------------------------------------------------------- checks

const text = (doc: Document, selector: string) => doc.querySelector(selector)?.textContent?.trim() ?? ''
const style = (doc: Document, selector: string) => {
  const el = doc.querySelector(selector)
  if (!el || !doc.defaultView) throw new Error(`No ${selector}`)
  return doc.defaultView.getComputedStyle(el)
}

// ---------------------------------------------------------------- 1. What a web page is made of

const profileStarter = '<h1>Your name</h1>\n<p>Write a sentence about yourself here.</p>\n\n<h2>Things I want to build</h2>\n<ul>\n  <li>A robot</li>\n</ul>\n'

export const webPageBasics: Lesson = {
  id: 'what-a-web-page-is-made-of',
  title: 'What a web page is made of',
  minutes: 10,
  goal: 'Write HTML tags that make a heading, a paragraph and a list.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'Pages are made of tags',
      frames: [
        {
          title: 'Tags label each part',
          text: 'HTML wraps each piece of a page in tags. The opening tag says what the piece is. The closing tag, with a slash, says where it ends.',
          visual: <TagAnatomy />,
        },
        {
          title: 'Tags go inside tags',
          text: 'A list tag holds item tags, like boxes inside boxes. This nesting gives a page its structure.',
          visual: <NestedBoxes />,
        },
        {
          title: 'The browser draws it for you',
          text: 'You write the tags. The browser turns them into the headings, paragraphs and lists people see.',
          visual: <CodeAndPage />,
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'Biggest heading',
      prompt: 'Which tag makes the biggest heading?',
      language: 'html',
      options: [
        { text: '<h1>', correct: true, feedback: 'Yes. h1 is the main heading. Importance goes down as the number goes up: h2, h3, all the way to h6.' },
        { text: '<h6>', feedback: 'h6 is the smallest heading. The lower the number, the more important the heading.' },
        { text: '<p>', feedback: 'p is for paragraphs of normal text, not headings.' },
      ],
    },
    {
      stage: 'do',
      kind: 'web',
      title: 'Fix the broken page',
      intro: 'The heading has swallowed the paragraph because its closing tag is missing. Add </h1> in the right place. The checklist updates as you type.',
      task: {
        starter: '<h1>My robot\n<p>It follows lines and never gets bored.</p>\n',
        checks: [
          { label: 'The heading says “My robot”', test: (doc) => text(doc, 'h1') === 'My robot' },
          { label: 'The paragraph is outside the heading', test: (doc) => Boolean(doc.querySelector('p')) && !doc.querySelector('h1 p') },
        ],
        hint: 'Put </h1> straight after the words My robot, on the first line.',
        solution: '<h1>My robot</h1>\n<p>It follows lines and never gets bored.</p>\n',
      },
    },
    {
      stage: 'build',
      kind: 'web',
      title: 'Make your profile page',
      intro: 'Build a small page about you. Swap the words for your own and watch the preview change.',
      task: {
        starter: profileStarter,
        checks: [
          { label: 'Your name is in the h1', test: (doc) => !['', 'Your name'].includes(text(doc, 'h1')) },
          {
            label: 'A sentence about you, at least 20 characters long',
            test: (doc) => text(doc, 'p').length >= 20 && text(doc, 'p') !== 'Write a sentence about yourself here.',
          },
          { label: 'At least 3 things in your list', test: (doc) => doc.querySelectorAll('ul li').length >= 3 },
        ],
        hint: 'Copy the line <li>A robot</li>, paste it twice underneath, then change the words.',
        solution:
          '<h1>Sam Rivera</h1>\n<p>I like taking things apart to see how they work.</p>\n\n<h2>Things I want to build</h2>\n<ul>\n  <li>A robot</li>\n  <li>A game for my friends</li>\n  <li>My own website</li>\n</ul>\n',
      },
    },
  ],
}

// ---------------------------------------------------------------- 2. Style it with CSS

export const styleWithCss: Lesson = {
  id: 'style-it-with-css',
  title: 'Style it with CSS',
  minutes: 12,
  goal: 'Use CSS rules to change colors, sizes and spacing.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'CSS gives a page its look',
      frames: [
        {
          title: 'A rule has a target and a style',
          text: 'The selector picks which tags to style. Inside the curly brackets, each line sets one property to a value.',
          visual: <RuleAnatomy />,
        },
        {
          title: 'One rule styles every match',
          text: 'A rule for p styles every paragraph on the page at once. Change it in one place and they all change.',
          visual: <OneRuleMany />,
        },
        {
          title: 'Padding is space inside the box',
          text: 'Every tag is a box. Padding adds space between the content and the edge of the box. A border draws that edge.',
          visual: <BoxModel />,
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'What color?',
      prompt: 'What color is the paragraph text?',
      code: '<style>\n  p { color: green; }\n  h1 { color: purple; }\n</style>\n\n<p>Hello!</p>',
      language: 'html',
      options: [
        { text: 'Green', correct: true, feedback: 'Yes. The p rule matches the paragraph. The h1 rule only styles h1 headings.' },
        { text: 'Purple', feedback: 'Purple is for h1 tags, and there’s no h1 on this page.' },
        { text: 'Black, the default', feedback: 'The p rule changes it. Default black only shows when no rule matches.' },
      ],
    },
    {
      stage: 'do',
      kind: 'web',
      title: 'Style the heading',
      intro: 'Inside the h1 rule, give the heading a color and make it bigger. Try a color name like tomato, or a code like #5B4BE0.',
      task: {
        starter: '<style>\n  h1 {\n    \n  }\n</style>\n\n<h1>My robot</h1>\n<p>It follows lines and never gets bored.</p>\n',
        checks: [
          { label: 'The heading has a color that isn’t black', test: (doc) => style(doc, 'h1').color !== 'rgb(0, 0, 0)' },
          { label: 'The heading is bigger than 40px', test: (doc) => parseFloat(style(doc, 'h1').fontSize) > 40 },
        ],
        hint: 'Inside the curly brackets, write color: tomato; on one line and font-size: 48px; on the next.',
        solution:
          '<style>\n  h1 {\n    color: tomato;\n    font-size: 48px;\n  }\n</style>\n\n<h1>My robot</h1>\n<p>It follows lines and never gets bored.</p>\n',
      },
    },
    {
      stage: 'build',
      kind: 'web',
      title: 'Style your card',
      intro: 'Turn the profile into a card with a background, some padding and rounded corners. The dot in .card targets every tag with class="card".',
      task: {
        starter:
          '<style>\n  .card {\n    \n  }\n</style>\n\n<div class="card">\n  <h1>Sam Rivera</h1>\n  <p>I like taking things apart to see how they work.</p>\n</div>\n',
        checks: [
          { label: 'The card has a background color', test: (doc) => style(doc, '.card').backgroundColor !== 'rgba(0, 0, 0, 0)' },
          { label: 'The card has at least 16px of padding', test: (doc) => parseFloat(style(doc, '.card').paddingTop) >= 16 },
          { label: 'The card has rounded corners', test: (doc) => parseFloat(style(doc, '.card').borderTopLeftRadius) > 0 },
        ],
        hint: 'Inside .card { }, try background: lavender; then padding: 24px; then border-radius: 16px;',
        solution:
          '<style>\n  .card {\n    background: lavender;\n    padding: 24px;\n    border-radius: 16px;\n  }\n</style>\n\n<div class="card">\n  <h1>Sam Rivera</h1>\n  <p>I like taking things apart to see how they work.</p>\n</div>\n',
      },
    },
  ],
}

export const softwareEngineeringLessons = [webPageBasics, styleWithCss]
