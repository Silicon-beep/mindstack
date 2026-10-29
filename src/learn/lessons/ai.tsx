import { NeuronPlane, show } from '../components/NeuronExercise'
import { Flow } from '../components/visuals'
import { trainFully } from '../neuron'
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

export const aiLessons = [teachANeuron, trainingDataMatters]
