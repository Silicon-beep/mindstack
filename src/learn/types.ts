import type { ReactNode } from 'react'
import type { Language } from './highlight'
import type { ChipId } from './robot/chips'
import type { Check } from './robot/checks'
import type { World } from './robot/world'

// Every lesson moves through the same three stages, in this order.
export type Stage = 'see' | 'do' | 'build'

export type ExplainFrame = { title: string; text: string; visual: ReactNode }

export type PredictOption = { text: string; correct?: boolean; feedback: string }

export type RobotTask = {
  world: World
  starter: string
  check: Check
  hint: string
  solution: string
  chips?: ChipId[]
  showSensor?: boolean
  showConsole?: boolean
}

export type WebCheck = { label: string; test: (doc: Document) => boolean }
export type WebTask = { starter: string; checks: WebCheck[]; hint: string; solution: string }

export type Weights = { w1: number; w2: number; b: number }
export type NeuronPoint = { x: number; y: number; label: 0 | 1 }
export type NeuronExtra = { name: string; point: NeuronPoint; helps?: boolean }
export type NeuronTask = {
  mode: 'manual' | 'train'
  points: NeuronPoint[]
  start: Weights
  classes: [string, string]
  axes: [string, string]
  hint: string
  // Manual mode: weights that do the task, for "Show me a solution". Train mode just trains.
  solution?: Weights
  // New examples the neuron never trains on, drawn hollow. With mustPassTests, they must all be right too.
  tests?: NeuronPoint[]
  mustPassTests?: boolean
  // Examples the learner can add to the training data. "Show me a solution" adds the ones that help.
  extras?: NeuronExtra[]
  // What counts as done, if not "every example sorted": enough right, or no false alarms (class 0 called class 1).
  goal?: { atLeast?: number; noFalseAlarms?: boolean; caughtAtLeast?: number }
  // Said when the task is done, instead of the usual message.
  success?: string
}

// A tiny network: neuron A says yes when the first clue is above `a`, neuron B when the second clue is above
// `b`, and neuron C answers class 1 when both say yes ('and') or when either does ('or').
export type Network = { a: number; b: number; rule: 'and' | 'or' }
export type NetworkTask = {
  points: NeuronPoint[]
  classes: [string, string]
  axes: [string, string]
  start: Network
  // Let the learner choose neuron C's rule. Otherwise it stays as it starts.
  chooseRule?: boolean
  hint: string
  solution: Network
  success?: string
}

type ScreenBase = { stage: Stage; title: string; intro?: string }

export type Screen = ScreenBase &
  (
    | { kind: 'explain'; frames: ExplainFrame[] }
    | { kind: 'predict'; prompt: string; options: PredictOption[]; code?: string; language?: Language; visual?: ReactNode }
    | { kind: 'robot'; task: RobotTask }
    | { kind: 'web'; task: WebTask }
    | { kind: 'neuron'; task: NeuronTask }
    | { kind: 'network'; task: NetworkTask }
  )

export type Lesson = {
  id: string
  title: string
  minutes: number
  // The one thing the learner can do by the end, shown at the top of every screen.
  goal: string
  screens: Screen[]
}

export type ComingSoon = { id: string; title: string; minutes: number; comingSoon: true }
