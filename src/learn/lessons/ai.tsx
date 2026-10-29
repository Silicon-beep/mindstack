import { learnUi } from '../../content'
import { DoodleImage } from '../components/DoodleExercise'
import { NetworkPlane } from '../components/NetworkExercise'
import { NeuronPlane, show } from '../components/NeuronExercise'
import { Captioned, Flow, Pair } from '../components/visuals'
import { cluesOf, doodlePoint, doodleStart, parseDoodle } from '../doodle'
import { predict, trainFully } from '../neuron'
import type { Lesson, NeuronPoint, Weights } from '../types'

const fruit = {
  classes: ['Apple', 'Orange'] as [string, string],
  axes: ['Size', 'Bumpiness'] as [string, string],
  points: [
    { x: 2, y: 2, label: 0 },
    { x: 3, y: 1.5, label: 0 },
    { x: 2.5, y: 3, label: 0 },
    { x: 4, y: 2.5, label: 0 },
    { x: 3.5, y: 3.5, label: 0 },
    { x: 6, y: 7, label: 1 },
    { x: 7, y: 6, label: 1 },
    { x: 7.5, y: 8, label: 1 },
    { x: 6.5, y: 5.5, label: 1 },
    { x: 8, y: 7, label: 1 },
  ] as NeuronPoint[],
}

const email = {
  classes: ['Not spam', 'Spam'] as [string, string],
  axes: ['Links', 'Exclamation marks'] as [string, string],
  points: [
    { x: 1, y: 1, label: 0 },
    { x: 2, y: 0.5, label: 0 },
    { x: 0.5, y: 3, label: 0 },
    { x: 3, y: 2, label: 0 },
    { x: 2, y: 4, label: 0 },
    { x: 4, y: 1, label: 0 },
    { x: 7, y: 6, label: 1 },
    { x: 8, y: 8, label: 1 },
    { x: 6, y: 9, label: 1 },
    { x: 9, y: 4, label: 1 },
    { x: 7.5, y: 8.5, label: 1 },
    { x: 5.5, y: 7, label: 1 },
  ] as NeuronPoint[],
}

function NeuronDiagram() {
  return (
    <svg viewBox="0 0 360 200" role="img" aria-label="Two clues, size and bumpiness, each multiplied by a weight, added up, then turned into an answer." className="h-auto w-full max-w-md">
      {[
        { y: 50, label: 'Size', weight: '× 1' },
        { y: 150, label: 'Bumpiness', weight: '× 1' },
      ].map((input) => (
        <g key={input.label}>
          <line x1={110} y1={input.y} x2={200} y2={100} strokeWidth={3} className="stroke-violet" />
          <rect x={10} y={input.y - 22} width={100} height={44} rx={22} className="fill-white" />
          <text x={60} y={input.y + 5} textAnchor="middle" className="fill-ink text-[14px] font-semibold">{input.label}</text>
          <text x={156} y={(input.y + 100) / 2 - 6} textAnchor="middle" className="fill-violet-dark text-[14px] font-bold">{input.weight}</text>
        </g>
      ))}
      <circle cx={225} cy={100} r={28} className="fill-violet" />
      <text x={225} y={107} textAnchor="middle" className="fill-white text-[20px] font-bold">Σ</text>
      <line x1={253} y1={100} x2={276} y2={100} strokeWidth={3} className="stroke-violet" />
      <rect x={276} y={78} width={78} height={44} rx={22} className="fill-white" />
      <text x={315} y={105} textAnchor="middle" className="fill-ink text-[14px] font-semibold">Orange?</text>
    </svg>
  )
}

function NeuronMath() {
  return (
    <div className="w-full max-w-md rounded-card bg-white p-6 shadow-soft">
      <p className="font-mono text-lg leading-loose">
        1 × <span className="font-semibold text-violet-dark">size</span> + 1 × <span className="font-semibold text-violet-dark">bumpiness</span> − 9
      </p>
      <p className="mt-4 text-muted">For a big, bumpy fruit (size 7, bumpiness 6):</p>
      <p className="mt-1 font-mono text-lg">7 + 6 − 9 = <strong>4</strong></p>
      <p className="mt-3 font-semibold text-green-dark">Above zero, so: orange</p>
    </div>
  )
}

export const teachANeuron: Lesson = {
  id: 'teach-a-neuron',
  title: 'Teach a neuron',
  minutes: 12,
  goal: 'Tune a neuron by hand, then watch one learn from its own mistakes.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'A neuron is a tiny voter',
      frames: [
        {
          title: 'It weighs up the clues',
          text: 'An artificial neuron takes clues, like how big a fruit is and how bumpy its skin is. It multiplies each clue by a weight, then adds them up.',
          visual: <NeuronDiagram />,
        },
        {
          title: 'The total decides',
          text: 'If the total is above zero, the neuron says orange. If not, it says apple. The bias at the end shifts how easily it says yes.',
          visual: <NeuronMath />,
        },
        {
          title: 'The weights draw a line',
          text: 'On a chart, the neuron’s rule becomes a line. Everything on one side gets one answer. Learning means moving that line.',
          visual: (
            <div className="w-full max-w-sm">
              <NeuronPlane weights={{ w1: 1, w2: 1, b: -9 }} {...fruit} />
            </div>
          ),
        },
        {
          title: 'Training is guess, check, nudge',
          text: 'To learn, a neuron guesses, checks the right answer, and nudges its weights a little whenever it’s wrong. Then it does it again.',
          visual: <Flow steps={['Guess', 'Check', 'Nudge']} loop />,
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'Do the math',
      prompt: 'This neuron says orange when size + bumpiness − 9 is above zero. A fruit has size 3 and bumpiness 4. What does the neuron say?',
      options: [
        { text: 'Apple', correct: true, feedback: 'Right: 3 + 4 − 9 = −2. That’s below zero, so it says apple.' },
        { text: 'Orange', feedback: 'Work it through: 3 + 4 − 9 = −2, which is below zero.' },
        { text: 'It can’t decide', feedback: 'A neuron always gives an answer. Below zero means apple.' },
      ],
    },
    {
      stage: 'do',
      kind: 'neuron',
      title: 'Move the line yourself',
      intro: 'Drag the sliders until every example is sorted correctly. Wrongly sorted ones have a dashed ring around them.',
      task: {
        mode: 'manual',
        start: { w1: 1, w2: -1, b: 0 },
        ...fruit,
        hint: 'Make both weights positive, then drag the bias down until the line sits in the gap between the two groups.',
        solution: { w1: 1, w2: 1, b: -9 },
      },
    },
    {
      stage: 'build',
      kind: 'neuron',
      title: 'Train a spam filter',
      intro: 'This time you don’t move the line. Press Train and the neuron learns from its mistakes, one email at a time. Watch the line move.',
      task: {
        mode: 'train',
        start: { w1: 0.5, w2: -0.5, b: 0 },
        ...email,
        hint: 'Keep pressing Train. Each press fixes one mistake a little, and about 11 presses sort every email.',
      },
    },
  ],
}

// ---------------------------------------------------------------- 2. Why training data matters

const pt = (x: number, y: number, label: 0 | 1): NeuronPoint => ({ x, y, label })
const fruitNames = { classes: fruit.classes, axes: fruit.axes }
// Every apple here is small and every orange is big, so size seems to be all that matters.
const oneSided = [
  pt(1.5, 2, 0),
  pt(2.5, 3.5, 0),
  pt(3, 1.5, 0),
  pt(2, 4.5, 0),
  pt(3.5, 3, 0),
  pt(7, 6, 1),
  pt(8, 7.5, 1),
  pt(7.5, 5.5, 1),
  pt(8.5, 6.5, 1),
  pt(6.5, 7.5, 1),
]
// Fruit it never trains on. The first is a big, smooth apple.
const newFruit = [pt(7.5, 1.5, 0), pt(3, 8.5, 1), pt(6, 2.5, 0), pt(4.5, 8, 1)]
const freshStart = { w1: 0.5, w2: -0.5, b: 0 }
const learnedOneSided = trainFully(freshStart, oneSided)

function LearnedWeights({ weights }: { weights: Weights }) {
  const rows: [string, number][] = [
    ['How much size matters', weights.w1],
    ['How much bumpiness matters', weights.w2],
  ]
  return (
    <div className="w-full max-w-md rounded-card bg-white p-6 shadow-soft">
      <p className="font-semibold">What it learned</p>
      <dl className="mt-4 grid gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">{label}</dt>
            <dd className="font-mono text-lg font-semibold">{show(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export const trainingDataMatters: Lesson = {
  id: 'training-data-matters',
  title: 'Why training data matters',
  minutes: 12,
  goal: 'See how the examples a neuron learns from decide what it gets right.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'It only knows its examples',
      frames: [
        {
          title: 'It learns from examples',
          text: 'A neuron learns its line from training examples. In these, every apple is small and every orange is big. Training finds a line that sorts them all.',
          visual: (
            <div className="w-full max-w-sm">
              <NeuronPlane weights={learnedOneSided} points={oneSided} {...fruitNames} />
            </div>
          ),
        },
        {
          title: 'It learned the wrong clue',
          text: 'Look at what it learned: size counts for a lot, and bumpiness for almost nothing. In its examples, big always meant orange, so that’s the rule it picked up.',
          visual: <LearnedWeights weights={learnedOneSided} />,
        },
        {
          title: 'Test it on new examples',
          text: 'The only fair test is examples it never trained on. If it gets those wrong, give it the kinds of examples it was missing.',
          visual: <Flow steps={['Train', 'Test on new examples', 'Add what’s missing']} loop />,
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'What does it say?',
      prompt: 'A big, smooth apple comes along: the hollow circle. What does this neuron say it is?',
      visual: (
        <div className="w-full max-w-sm">
          <NeuronPlane weights={learnedOneSided} points={oneSided} tests={[newFruit[0]]} {...fruitNames} />
        </div>
      ),
      options: [
        { text: 'Orange', correct: true, feedback: 'Yes, and it’s wrong. Every big fruit it trained on was an orange, so it says big means orange.' },
        { text: 'Apple', feedback: 'That’s what it really is, but not what this neuron says. The apple is on the orange side of its line.' },
        { text: 'It can’t decide', feedback: 'A neuron always gives an answer. This apple is on the orange side of its line.' },
      ],
    },
    {
      stage: 'do',
      kind: 'neuron',
      title: 'Train it, then test it',
      intro: 'Press Train until every training example is sorted. Then look at the hollow shapes: new fruit it never trained on.',
      task: {
        mode: 'train',
        start: freshStart,
        points: oneSided,
        tests: newFruit,
        ...fruitNames,
        hint: 'Keep pressing Train. About 10 presses sort every training example.',
        success: 'Every training example is sorted, but it gets all the new fruit wrong. It learned that big means orange.',
      },
    },
    {
      stage: 'build',
      kind: 'neuron',
      title: 'Fix the training data',
      intro: 'Add the kinds of fruit the neuron has never seen, then train it until it gets every new fruit right.',
      task: {
        mode: 'train',
        start: freshStart,
        points: oneSided,
        tests: newFruit,
        mustPassTests: true,
        extras: [
          { name: 'Another small, smooth apple', point: pt(2.5, 2.5, 0) },
          { name: 'A big, smooth apple', point: pt(8.5, 2, 0), helps: true },
          { name: 'Another big, bumpy orange', point: pt(8, 8.5, 1) },
          { name: 'A small, bumpy orange', point: pt(2, 8, 1), helps: true },
        ],
        ...fruitNames,
        hint: 'Look at which new fruit it gets wrong: a big apple and a small orange. Add those kinds of fruit, then press Train again. More of the same won’t help.',
        success: 'It gets every new fruit right. Seeing big apples and small oranges taught it that size alone doesn’t tell them apart.',
      },
    },
  ],
}

// ---------------------------------------------------------------- 3. When the neuron gets it wrong

const emailNames = { classes: email.classes, axes: email.axes }
// A messy inbox: one real newsletter full of links and exclamation marks, and one spam that looks normal.
const messy = [
  pt(1, 1, 0),
  pt(2.5, 0.5, 0),
  pt(0.5, 2.5, 0),
  pt(3, 2.5, 0),
  pt(1.5, 4, 0),
  pt(7, 6.5, 0),
  pt(7, 8.5, 1),
  pt(8.5, 8.5, 1),
  pt(5.5, 8.5, 1),
  pt(8.5, 5.5, 1),
  pt(6, 4.5, 1),
  pt(2, 2.5, 1),
]
const messyLine = { w1: 0.3, w2: 0.6, b: -4 }
// The same filter, stricter (a lower bar for calling something spam) and more relaxed.
const stricter = { w1: 0.6, w2: 0.6, b: -8 }
const relaxed = { w1: 0.6, w2: 0.6, b: -9 }
const several = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const mistakesOf = (w: Weights) => {
  const falseAlarms = messy.filter((p) => p.label === 0 && predict(w, p) === 1).length
  const missed = messy.filter((p) => p.label === 1 && predict(w, p) === 0).length
  return `${several(falseAlarms, 'false alarm')}, ${missed} missed`
}

function MistakeCards() {
  const cards = [
    { title: 'False alarm', also: 'a false positive', text: 'A real email goes to the spam folder.' },
    { title: 'Miss', also: 'a false negative', text: 'A spam email lands in your inbox.' },
  ]
  return (
    <div className="grid w-full max-w-md gap-3">
      {cards.map((card) => (
        <div key={card.title} className="rounded-card bg-white p-5 shadow-soft">
          <p className="text-lg font-bold">
            {card.title} <span className="text-base font-semibold text-muted">({card.also})</span>
          </p>
          <p className="mt-1 text-muted">{card.text}</p>
        </div>
      ))}
    </div>
  )
}

export const whenItGetsItWrong: Lesson = {
  id: 'when-it-gets-it-wrong',
  title: 'When the neuron gets it wrong',
  minutes: 10,
  goal: 'Tell the two kinds of mistake apart, and choose which one a neuron should avoid.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'Even a good neuron makes mistakes',
      frames: [
        {
          title: 'No line sorts them all',
          text: 'Real examples are messy. A newsletter can be full of links and exclamation marks, and some spam looks like a normal email. No straight line can sort all 12 of these.',
          visual: (
            <div className="w-full max-w-sm">
              <NeuronPlane weights={messyLine} points={messy} {...emailNames} />
            </div>
          ),
        },
        {
          title: 'Two kinds of mistake',
          text: 'A false alarm, or false positive, sends a real email to the spam folder. A miss, or false negative, lets spam into your inbox.',
          visual: <MistakeCards />,
        },
        {
          title: 'Moving the line swaps one for the other',
          text: 'A stricter filter catches more spam, but sends more real emails to spam. A more relaxed one lets more spam through. Which mistake matters more depends on the job.',
          visual: (
            <Pair>
              <Captioned caption={`Stricter: ${mistakesOf(stricter)}`}>
                <NeuronPlane weights={stricter} points={messy} {...emailNames} />
              </Captioned>
              <Captioned caption={`More relaxed: ${mistakesOf(relaxed)}`}>
                <NeuronPlane weights={relaxed} points={messy} {...emailNames} />
              </Captioned>
            </Pair>
          ),
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'Name the mistake',
      prompt: 'The filter sends your friend’s birthday email to the spam folder. What kind of mistake is that?',
      options: [
        { text: 'A false alarm (false positive)', correct: true, feedback: 'Yes. It said spam, but the email was real. That’s a false alarm.' },
        { text: 'A miss (false negative)', feedback: 'A miss is the other way round: spam that gets into your inbox. This was a real email sent to spam.' },
        { text: 'Not a mistake', feedback: 'It is a mistake: a real email ended up in the spam folder.' },
      ],
    },
    {
      stage: 'do',
      kind: 'neuron',
      title: 'Sort as many as you can',
      intro: 'No line can sort all 12 emails. Move the line until at least 9 are sorted correctly.',
      task: {
        mode: 'manual',
        start: { w1: 1, w2: -1, b: 0 },
        points: messy,
        goal: { atLeast: 9 },
        ...emailNames,
        hint: 'Make both weights positive first. Then drag the bias until the line sits between most of the spam and most of the real emails.',
        solution: { w1: 0.2, w2: 0.4, b: -3 },
        success: 'Nice line. With examples this messy, no line gets every email right.',
      },
    },
    {
      stage: 'build',
      kind: 'neuron',
      title: 'Never lose a real email',
      intro: 'Tune the filter so no real email goes to spam, and it still catches at least 3 of the 6 spam emails.',
      task: {
        mode: 'manual',
        start: { w1: 1, w2: -1, b: 0 },
        points: messy,
        goal: { noFalseAlarms: true, caughtAtLeast: 3 },
        ...emailNames,
        hint: 'Keep both weights positive and drag the bias down until False alarms reads 0. Then nudge the weights to catch as much spam as you can.',
        solution: { w1: 0.4, w2: 0.4, b: -5.5 },
        success: 'No real email goes to spam now. The price is some spam in your inbox: you swapped one mistake for the other.',
      },
    },
  ],
}

// ---------------------------------------------------------------- 4. Many neurons make a network

// Spam has lots of links and lots of exclamation marks. Newsletters have lots of links, and excited
// friends lots of exclamation marks, but neither is spam.
const spamCorner = [
  pt(1, 1.5, 0),
  pt(2.5, 2.5, 0),
  pt(9, 1.5, 0),
  pt(9.5, 4.5, 0),
  pt(1.5, 9, 0),
  pt(4.5, 9.5, 0),
  pt(6, 6, 1),
  pt(8, 8, 1),
  pt(7, 9, 1),
  pt(9, 7, 1),
]
// Suspicious if it has lots of links, or lots of exclamation marks, or both.
const suspicious = [
  pt(1, 1, 0),
  pt(2.5, 2, 0),
  pt(1.5, 3.5, 0),
  pt(3.5, 1, 0),
  pt(4.5, 4.5, 0),
  pt(6, 0.5, 1),
  pt(8, 2.5, 1),
  pt(0.5, 6, 1),
  pt(2.5, 8.5, 1),
  pt(8, 8, 1),
]
// As good as one line gets with the spam corner: 9 of 10.
const bestOneLine = { w1: 1, w2: 1, b: -15 }
const fencedIn = { a: 5, b: 5, rule: 'and' as const }

function NetworkDiagram() {
  const neuron = (cx: number, cy: number, name: string) => (
    <g>
      <circle cx={cx} cy={cy} r={22} className="fill-violet" />
      <text x={cx} y={cy + 6} textAnchor="middle" className="fill-white text-[17px] font-bold">{name}</text>
    </g>
  )
  return (
    <svg
      viewBox="0 0 360 220"
      role="img"
      aria-label="Links go into neuron A, which asks: lots of links? Exclamation marks go into neuron B, which asks: lots of exclamation marks? Neuron C takes both answers and says spam only when both say yes."
      className="h-auto w-full max-w-md"
    >
      <g strokeWidth={3} className="stroke-violet">
        <line x1={96} y1={58} x2={128} y2={58} />
        <line x1={96} y1={160} x2={128} y2={158} />
        <line x1={172} y1={58} x2={230} y2={96} />
        <line x1={172} y1={158} x2={230} y2={120} />
        <line x1={274} y1={108} x2={290} y2={108} />
      </g>
      <rect x={4} y={38} width={92} height={40} rx={20} className="fill-white" />
      <text x={50} y={63} textAnchor="middle" className="fill-ink text-[14px] font-semibold">Links</text>
      <rect x={4} y={136} width={92} height={48} rx={20} className="fill-white" />
      <text x={50} y={156} textAnchor="middle" className="fill-ink text-[13px] font-semibold">
        Exclamation
        <tspan x={50} dy={16}>marks</tspan>
      </text>
      {neuron(150, 58, 'A')}
      <text x={150} y={22} textAnchor="middle" className="fill-violet-dark text-[13px] font-semibold">Lots of links?</text>
      {neuron(150, 158, 'B')}
      <text x={150} y={206} textAnchor="middle" className="fill-violet-dark text-[13px] font-semibold">Lots of exclamation marks?</text>
      {neuron(252, 108, 'C')}
      <text x={252} y={152} textAnchor="middle" className="fill-violet-dark text-[13px] font-semibold">Both yes?</text>
      <rect x={290} y={88} width={66} height={40} rx={20} className="fill-white" />
      <text x={323} y={113} textAnchor="middle" className="fill-ink text-[14px] font-semibold">Spam?</text>
    </svg>
  )
}

export const manyNeurons: Lesson = {
  id: 'many-neurons',
  title: 'Many neurons make a network',
  minutes: 14,
  goal: 'Connect three neurons into a network that sorts what one neuron can’t.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'When one line isn’t enough',
      frames: [
        {
          title: 'One neuron, one straight line',
          text: 'Spam has lots of links and lots of exclamation marks. Newsletters have just links, and excited friends just exclamation marks. One neuron can only draw one straight line, and no straight line fences off just the spam.',
          visual: (
            <div className="w-full max-w-sm">
              <NeuronPlane weights={bestOneLine} points={spamCorner} {...emailNames} />
            </div>
          ),
        },
        {
          title: 'Split the job between neurons',
          text: 'Give each question to its own neuron. A asks “lots of links?” and B asks “lots of exclamation marks?”. A third neuron, C, takes their answers and says spam only when both say yes.',
          visual: <NetworkDiagram />,
        },
        {
          title: 'Together they fence off a corner',
          text: 'A and B each draw their own line, and C keeps only the corner past both. Neurons passing answers on to other neurons: that’s a neural network. Real ones have layers of many neurons and learn all their weights in training.',
          visual: (
            <div className="w-full max-w-sm">
              <NetworkPlane net={fencedIn} points={spamCorner} {...emailNames} />
            </div>
          ),
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'What does the network say?',
      prompt: 'An email has lots of links but hardly any exclamation marks. A says yes and B says no. What does C say?',
      visual: <NetworkDiagram />,
      options: [
        { text: 'Not spam', correct: true, feedback: 'Right. Only A said yes, and C needs both A and B to say yes.' },
        { text: 'Spam', feedback: 'C says spam only when both say yes, and B said no.' },
        { text: 'It can’t tell', feedback: 'It can: one yes and one no means not spam.' },
      ],
    },
    {
      stage: 'do',
      kind: 'network',
      title: 'Fence off the spam',
      intro: 'Slide the two lines so that only the spam is in the shaded corner.',
      task: {
        points: spamCorner,
        ...emailNames,
        start: { a: 2, b: 8, rule: 'and' },
        hint: 'A’s line should sit just to the left of the spam, and B’s line just below it. Newsletters and excited friends belong outside the corner.',
        solution: fencedIn,
        success: 'Every email sorted. Two neurons drew the lines and a third combined them: a tiny neural network.',
      },
    },
    {
      stage: 'build',
      kind: 'network',
      title: 'Build a suspicious-email checker',
      intro: 'Now any email with lots of links or lots of exclamation marks counts as suspicious. Move the lines, and choose when neuron C says yes.',
      task: {
        points: suspicious,
        classes: ['Looks fine', 'Suspicious'],
        axes: email.axes,
        start: { a: 7, b: 7, rule: 'and' },
        chooseRule: true,
        hint: 'With “both say yes”, only the top-right corner counts. Switch C to “either says yes”, then move both lines to just past the emails that look fine.',
        solution: { a: 5, b: 5, rule: 'or' },
        success: 'Same neurons, a different rule in C, a whole new shape. How neurons are connected decides what a network can do.',
      },
    },
  ],
}

// ---------------------------------------------------------------- 5. Project: train a doodle classifier

const doodleNames = { classes: ['Rocket', 'Car'] as [string, string], axes: ['How wide', 'How tall'] as [string, string] }
const rockets = [
  ['...#..', '..###.', '..###.', '..###.', '..###.', '..#.#.'],
  ['......', '..##..', '..##..', '..##..', '..##..', '..##..'],
  ['.#....', '###...', '###...', '###...', '#.#...', '......'],
]
const cars = [
  ['......', '......', '..##..', '######', '.#..#.', '......'],
  ['......', '......', '......', '#####.', '#####.', '.#.#..'],
  ['......', '......', '......', '......', '######', '.#..#.'],
]
const newRocket = ['..##..', '..##..', '..##..', '..##..', '..##..', '..##..']
const doodleExamples = [...rockets.map((drawing) => ({ drawing, label: 0 as const })), ...cars.map((drawing) => ({ drawing, label: 1 as const }))]
const doodlePoints = doodleExamples.flatMap(({ drawing, label }) => {
  const found = cluesOf(parseDoodle(drawing))
  return found ? [doodlePoint(found, label)] : []
})
const learnedDoodles = trainFully(doodleStart, doodlePoints)
const firstRocket = cluesOf(parseDoodle(rockets[0])) ?? { wide: 0, tall: 0 }
const wideDoodle = doodlePoint({ wide: 5, tall: 2 }, 1)
const doodleTicks: [string, string, string] = ['0', '3', '6']

export const doodleClassifier: Lesson = {
  id: 'doodle-classifier',
  title: 'Project: train a doodle classifier',
  minutes: 20,
  goal: 'Make your own training data, train a neuron on it, and test it with a new doodle.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'From doodles to numbers',
      frames: [
        {
          title: 'A neuron can’t see pictures',
          text: `A neuron only works with numbers, so each doodle becomes two clues: how many squares wide it is, and how many tall. This rocket is ${firstRocket.wide} wide and ${firstRocket.tall} tall.`,
          visual: (
            <Captioned caption={learnUi.exercise.doodleClues(firstRocket.wide, firstRocket.tall)}>
              <DoodleImage drawing={rockets[0]} label={`A rocket doodle, ${learnUi.exercise.doodleClues(firstRocket.wide, firstRocket.tall)}`} />
            </Captioned>
          ),
        },
        {
          title: 'Each doodle becomes a dot',
          text: 'Two clues give every doodle a spot on the chart, just like the fruit and the emails. Tall, thin rockets land top left, and wide, flat cars bottom right, so a neuron can learn a line between them.',
          visual: (
            <div className="w-full max-w-sm">
              <NeuronPlane weights={learnedDoodles} points={doodlePoints} ticks={doodleTicks} {...doodleNames} />
            </div>
          ),
        },
        {
          title: 'Real doodle recognisers',
          text: 'Google’s Quick, Draw! is a game built with machine learning. Its players have drawn 50 million doodles in 345 categories, recorded stroke by stroke. Yours will learn from a handful of doodles and two clues, but the idea is the same: examples in, guesses out.',
          visual: <Flow steps={['Draw examples', 'Train', 'Test a new doodle']} />,
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'Rocket or car?',
      prompt: 'This trained neuron sees a new doodle, 5 squares wide and 2 tall: the hollow shape. What does it say?',
      visual: (
        <div className="w-full max-w-sm">
          <NeuronPlane weights={learnedDoodles} points={doodlePoints} tests={[wideDoodle]} ticks={doodleTicks} {...doodleNames} />
        </div>
      ),
      options: [
        { text: 'Car', correct: true, feedback: 'Yes. It’s wider than it is tall, so its dot lands on the car side of the line.' },
        { text: 'Rocket', feedback: 'Rockets are taller than they are wide. This doodle is the other way round.' },
        { text: 'Nothing, it has never seen this doodle', feedback: 'It doesn’t need to have seen it. Its two clues put it on the car side of the line.' },
      ],
    },
    {
      stage: 'do',
      kind: 'doodle',
      title: 'Draw a rocket',
      intro: 'Draw a rocket: at least 4 squares tall and no more than 2 squares wide. Watch its clues change as you draw.',
      task: {
        mode: 'clues',
        ...doodleNames,
        target: { tallAtLeast: 4, wideAtMost: 2 },
        hint: 'Fill a column from top to bottom, no more than 2 squares wide. The clues measure the box around everything you’ve drawn, so one stray square far away makes it wider.',
        success: 'That’s a rocket shape: tall and thin. Those two numbers are all the neuron will ever know about it.',
        solution: { drawing: rockets[1] },
      },
    },
    {
      stage: 'build',
      kind: 'doodle',
      title: 'Train your doodle classifier',
      intro: 'Draw at least 3 rockets and 3 cars, adding each one as you go. Train the neuron until it sorts them all, then draw a new doodle and ask what it thinks it is.',
      task: {
        mode: 'classifier',
        ...doodleNames,
        hint: 'Make rockets tall and thin, and cars wide and flat. If training never finishes, look for an example on the wrong side, like a rocket that’s wider than it is tall, and start over.',
        success: 'You built a doodle classifier: you made its training data, trained it, and tested it on a doodle it had never seen.',
        solution: { examples: doodleExamples, test: newRocket },
      },
    },
  ],
}

export const aiLessons = [teachANeuron, trainingDataMatters, whenItGetsItWrong, manyNeurons, doodleClassifier]
