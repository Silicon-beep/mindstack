// A small, friendly subset of Python for driving the robot:
//   robot.move()  robot.move(3)  robot.turn(90)  robot.turn_left()  robot.turn_right()
//   for i in range(4):   while <condition>:   if / elif / else   print(...)   pass
// Sensors: robot.light()  robot.on_line()  robot.front_is_clear()  robot.at_goal()
//          robot.line_ahead()  robot.line_left()  robot.line_right()
// Every mistake becomes a CodeError with a line number and a plain-language fix.
import { ahead, cellKey, inside, isOpen, lightAt, turnDir, type Pos, type Robot, type World } from './world'

export class CodeError extends Error {
  readonly line: number
  constructor(line: number, message: string) {
    super(message)
    this.line = line
  }
}

const COMMANDS = ['move', 'turn', 'turn_left', 'turn_right'] as const
const SENSORS = ['light', 'on_line', 'front_is_clear', 'at_goal', 'line_ahead', 'line_left', 'line_right'] as const
const KEYWORDS = ['for', 'while', 'if', 'print', 'robot', 'pass']
type Command = (typeof COMMANDS)[number]
type Sensor = (typeof SENSORS)[number]
const isCommand = (name: string): name is Command => (COMMANDS as readonly string[]).includes(name)
const isSensor = (name: string): name is Sensor => (SENSORS as readonly string[]).includes(name)

type Value = number | string | boolean

type Expr =
  | { t: 'value'; v: Value }
  | { t: 'var'; name: string }
  | { t: 'sensor'; name: Sensor }
  | { t: 'not'; e: Expr }
  | { t: 'bin'; op: string; a: Expr; b: Expr }

type Stmt =
  | { t: 'cmd'; line: number; name: Command; args: Expr[] }
  | { t: 'print'; line: number; e: Expr }
  | { t: 'pass'; line: number }
  | { t: 'for'; line: number; name: string; count: Expr; body: Stmt[] }
  | { t: 'while'; line: number; cond: Expr; body: Stmt[] }
  | { t: 'if'; line: number; branches: { cond: Expr | null; body: Stmt[] }[] }

// ---------------------------------------------------------------- tokens

type Token = { type: 'name' | 'num' | 'str' | 'op'; value: string }

function tokenize(text: string, line: number): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    const rest = text.slice(i)
    const word = /^[A-Za-z_]\w*/.exec(rest)
    const num = /^\d+/.exec(rest)
    if (ch === ' ') {
      i++
    } else if (word) {
      tokens.push({ type: 'name', value: word[0] })
      i += word[0].length
    } else if (num) {
      tokens.push({ type: 'num', value: num[0] })
      i += num[0].length
    } else if (ch === '"' || ch === "'") {
      const end = text.indexOf(ch, i + 1)
      if (end === -1) throw new CodeError(line, 'A piece of text is missing its closing quote mark.')
      tokens.push({ type: 'str', value: text.slice(i + 1, end) })
      i = end + 1
    } else if (['<=', '>=', '==', '!='].includes(rest.slice(0, 2))) {
      tokens.push({ type: 'op', value: rest.slice(0, 2) })
      i += 2
    } else if ('().,:<>+-='.includes(ch)) {
      tokens.push({ type: 'op', value: ch })
      i++
    } else if ('“”‘’'.includes(ch)) {
      throw new CodeError(line, 'Use straight quote marks (") in code, not curly ones.')
    } else {
      throw new CodeError(line, `I don’t understand the symbol “${ch}” here.`)
    }
  }
  return tokens
}

class Tokens {
  readonly line: number
  private readonly list: Token[]
  private index = 0

  constructor(list: Token[], line: number) {
    this.list = list
    this.line = line
  }

  peek(): Token | undefined {
    return this.list[this.index]
  }

  last(): Token | undefined {
    return this.list[this.list.length - 1]
  }

  next(): Token {
    const token = this.list[this.index++]
    if (!token) throw new CodeError(this.line, 'This line stops too early. Is something missing at the end?')
    return token
  }

  is(value: string) {
    const token = this.peek()
    return token !== undefined && token.type !== 'str' && token.value === value
  }

  accept(value: string) {
    if (!this.is(value)) return false
    this.index++
    return true
  }

  expect(value: string, message: string) {
    if (!this.accept(value)) throw new CodeError(this.line, message)
  }

  end() {
    if (this.index < this.list.length) throw new CodeError(this.line, 'There’s something extra at the end of this line.')
  }
}

// ---------------------------------------------------------------- expressions

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const saved = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = saved
    }
  }
  return row[b.length]
}

function closest(word: string, options: readonly string[]) {
  let best: string | null = null
  let bestScore = 3
  for (const option of options) {
    const score = distance(word.toLowerCase(), option)
    if (score < bestScore) {
      best = option
      bestScore = score
    }
  }
  return best
}

function robotCall(t: Tokens, word: string, want: 'command' | 'sensor') {
  if (word === 'Robot') throw new CodeError(t.line, 'Python cares about capital letters. Write robot with a small r.')
  t.expect('.', 'Put a dot after robot, like robot.move().')
  const name = t.next()
  if (name.type !== 'name') throw new CodeError(t.line, 'After robot. comes a command, like robot.move().')
  const n = name.value
  if (want === 'command' && isSensor(n))
    throw new CodeError(t.line, `robot.${n}() is a reading, not an action. Use it inside print(), if or while.`)
  if (want === 'sensor' && isCommand(n))
    throw new CodeError(t.line, `robot.${n}() is an action, so it can’t be used as a value. Put it on its own line.`)
  if (!isCommand(n) && !isSensor(n)) {
    const guess = closest(n, [...COMMANDS, ...SENSORS])
    throw new CodeError(
      t.line,
      guess ? `The robot doesn’t know “${n}”. Did you mean robot.${guess}()?` : `The robot doesn’t know “${n}”.`,
    )
  }
  if (!t.is('(')) throw new CodeError(t.line, `Add brackets to use it: robot.${n}()`)
  t.next()
  const args: Expr[] = []
  if (!t.is(')')) {
    do args.push(expression(t))
    while (t.accept(','))
  }
  t.expect(')', 'A closing bracket ) is missing.')
  if (isSensor(n) && args.length > 0) throw new CodeError(t.line, `robot.${n}() doesn’t take anything inside its brackets.`)
  return { name: n, args }
}

function expression(t: Tokens): Expr {
  let e = conjunction(t)
  while (t.accept('or')) e = { t: 'bin', op: 'or', a: e, b: conjunction(t) }
  return e
}

function conjunction(t: Tokens): Expr {
  let e = negation(t)
  while (t.accept('and')) e = { t: 'bin', op: 'and', a: e, b: negation(t) }
  return e
}

function negation(t: Tokens): Expr {
  if (t.accept('not')) return { t: 'not', e: negation(t) }
  return comparison(t)
}

function comparison(t: Tokens): Expr {
  const a = sum(t)
  const op = t.peek()
  if (op?.type === 'op' && ['<', '>', '<=', '>=', '==', '!='].includes(op.value)) {
    t.next()
    return { t: 'bin', op: op.value, a, b: sum(t) }
  }
  if (op?.type === 'op' && op.value === '=')
    throw new CodeError(t.line, 'Use == to compare two values. A single = stores a value, which these lessons don’t use yet.')
  return a
}

function sum(t: Tokens): Expr {
  let e = unary(t)
  while (t.is('+') || t.is('-')) {
    const op = t.next().value
    e = { t: 'bin', op, a: e, b: unary(t) }
  }
  return e
}

function unary(t: Tokens): Expr {
  if (t.accept('-')) return { t: 'bin', op: '-', a: { t: 'value', v: 0 }, b: unary(t) }
  return primary(t)
}

function primary(t: Tokens): Expr {
  const token = t.next()
  if (token.type === 'num') return { t: 'value', v: Number(token.value) }
  if (token.type === 'str') return { t: 'value', v: token.value }
  if (token.value === '(') {
    const e = expression(t)
    t.expect(')', 'A closing bracket ) is missing.')
    return e
  }
  if (token.type === 'name') {
    if (token.value === 'True' || token.value === 'False') return { t: 'value', v: token.value === 'True' }
    if (token.value === 'robot' || token.value === 'Robot') {
      return { t: 'sensor', name: robotCall(t, token.value, 'sensor').name as Sensor }
    }
    return { t: 'var', name: token.value }
  }
  throw new CodeError(t.line, `I didn’t expect “${token.value}” here.`)
}

// ---------------------------------------------------------------- statements

type SourceLine = { num: number; indent: number; text: string }

function stripComment(text: string) {
  let quote: string | null = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === quote) quote = null
    } else if (ch === '"' || ch === "'") {
      quote = ch
    } else if (ch === '#') {
      return text.slice(0, i)
    }
  }
  return text
}

function splitLines(source: string): SourceLine[] {
  return source.split('\n').flatMap((raw, i) => {
    const text = stripComment(raw.replace(/\t/g, '    ')).trimEnd()
    if (!text.trim()) return []
    return [{ num: i + 1, indent: text.length - text.trimStart().length, text: text.trim() }]
  })
}

const HEADER_WORDS = ['for', 'while', 'if', 'elif', 'else']

function lineTokens(line: SourceLine) {
  const t = new Tokens(tokenize(line.text, line.num), line.num)
  const word = t.peek()!.value
  if (HEADER_WORDS.includes(word) && t.last()!.value !== ':')
    throw new CodeError(line.num, `A line that starts with ${word} needs a colon (:) at the end.`)
  return { t, word }
}

export function parse(source: string): Stmt[] {
  const lines = splitLines(source)
  let pos = 0

  if (lines[0] && lines[0].indent > 0)
    throw new CodeError(lines[0].num, 'The first line shouldn’t start with spaces. Remove them.')

  function block(indent: number): Stmt[] {
    const body: Stmt[] = []
    while (pos < lines.length && lines[pos].indent >= indent) {
      const line = lines[pos]
      if (line.indent > indent)
        throw new CodeError(
          line.num,
          'This line has more spaces in front than the line above. Line it up, or put it under a line that ends with a colon.',
        )
      body.push(statement(line))
    }
    return body
  }

  function childBlock(header: SourceLine, what: string): Stmt[] {
    const next = lines[pos]
    if (!next || next.indent <= header.indent)
      throw new CodeError(header.num, `Put the lines that belong to this ${what} underneath it, indented by 4 spaces.`)
    return block(next.indent)
  }

  function statement(line: SourceLine): Stmt {
    pos++
    const { t, word } = lineTokens(line)

    if (word === 'for') {
      const shape = 'Write loops like this: for i in range(4):'
      t.next()
      const name = t.next()
      if (name.type !== 'name') throw new CodeError(line.num, shape)
      t.expect('in', shape)
      t.expect('range', shape)
      t.expect('(', shape)
      const count = expression(t)
      t.expect(')', 'A closing bracket ) is missing.')
      t.expect(':', shape)
      t.end()
      return { t: 'for', line: line.num, name: name.value, count, body: childBlock(line, 'for loop') }
    }

    if (word === 'while') {
      t.next()
      const cond = expression(t)
      t.expect(':', 'A while line needs a colon (:) at the end.')
      t.end()
      return { t: 'while', line: line.num, cond, body: childBlock(line, 'while loop') }
    }

    if (word === 'if') {
      t.next()
      const cond = expression(t)
      t.expect(':', 'An if line needs a colon (:) at the end.')
      t.end()
      const branches: { cond: Expr | null; body: Stmt[] }[] = [{ cond, body: childBlock(line, 'if') }]
      while (pos < lines.length && lines[pos].indent === line.indent) {
        const nextLine = lines[pos]
        const next = lineTokens(nextLine)
        if (next.word !== 'elif' && next.word !== 'else') break
        pos++
        next.t.next()
        if (next.word === 'elif') {
          const elifCond = expression(next.t)
          next.t.expect(':', 'An elif line needs a colon (:) at the end.')
          next.t.end()
          branches.push({ cond: elifCond, body: childBlock(nextLine, 'elif') })
        } else {
          next.t.expect(':', 'Write else with just a colon after it: else:')
          next.t.end()
          branches.push({ cond: null, body: childBlock(nextLine, 'else') })
          break
        }
      }
      return { t: 'if', line: line.num, branches }
    }

    if (word === 'elif' || word === 'else')
      throw new CodeError(line.num, `${word} needs an if above it, lined up with the same number of spaces.`)

    const first = t.next()
    let stmt: Stmt
    if (first.value === 'pass') {
      stmt = { t: 'pass', line: line.num }
    } else if (first.value === 'print') {
      t.expect('(', 'print needs brackets, like print(robot.light())')
      const e = expression(t)
      t.expect(')', 'A closing bracket ) is missing.')
      stmt = { t: 'print', line: line.num, e }
    } else if (first.value === 'robot' || first.value === 'Robot') {
      const call = robotCall(t, first.value, 'command')
      stmt = { t: 'cmd', line: line.num, name: call.name as Command, args: call.args }
    } else if (isCommand(first.value) || isSensor(first.value)) {
      throw new CodeError(line.num, `Commands start with robot. Try robot.${first.value}()`)
    } else {
      const guess = closest(first.value, KEYWORDS)
      throw new CodeError(
        line.num,
        guess ? `I don’t know “${first.value}”. Did you mean ${guess}?` : `I don’t know “${first.value}”.`,
      )
    }
    t.end()
    return stmt
  }

  return block(0)
}

// ---------------------------------------------------------------- running

// Frames point into the shared trail / collected / output arrays by length, so a long run stays cheap.
export type Frame = { line: number; robot: Robot; trailLength: number; collectedLength: number; outputLength: number }
export type RunResult = { frames: Frame[]; trail: Pos[]; collected: string[]; output: string[]; error: CodeError | null }

const truthy = (v: Value) => (typeof v === 'string' ? v.length > 0 : Boolean(v))
const format = (v: Value) => (v === true ? 'True' : v === false ? 'False' : String(v))

export function run(source: string, world: World, maxSteps = 1000): RunResult {
  let robot: Robot = { ...world.start }
  const trail: Pos[] = [{ x: robot.x, y: robot.y }]
  const collected: string[] = []
  const output: string[] = []
  const frames: Frame[] = []
  const stars = new Set(world.stars)
  const vars = new Map<string, Value>()
  let steps = 0

  const snapshot = (line: number) =>
    frames.push({
      line,
      robot: { ...robot },
      trailLength: trail.length,
      collectedLength: collected.length,
      outputLength: output.length,
    })

  const tick = (line: number) => {
    steps += 1
    if (steps > maxSteps)
      throw new CodeError(
        line,
        `The program ran ${maxSteps} steps without finishing. If you used while, check that its condition can become false.`,
      )
  }

  function sensor(name: Sensor): Value {
    switch (name) {
      case 'light':
        return lightAt(world, robot)
      case 'on_line':
        return world.line.has(cellKey(robot))
      case 'front_is_clear':
        return isOpen(world, ahead(robot, robot.dir))
      case 'at_goal':
        return world.goal !== null && robot.x === world.goal.x && robot.y === world.goal.y
      case 'line_ahead':
        return world.line.has(cellKey(ahead(robot, robot.dir)))
      case 'line_left':
        return world.line.has(cellKey(ahead(robot, turnDir(robot.dir, -1))))
      case 'line_right':
        return world.line.has(cellKey(ahead(robot, turnDir(robot.dir, 1))))
    }
  }

  function evaluate(e: Expr, line: number): Value {
    switch (e.t) {
      case 'value':
        return e.v
      case 'var': {
        const v = vars.get(e.name)
        if (v === undefined) throw new CodeError(line, `I don’t know what “${e.name}” is.`)
        return v
      }
      case 'sensor':
        return sensor(e.name)
      case 'not':
        return !truthy(evaluate(e.e, line))
      case 'bin': {
        if (e.op === 'and') return truthy(evaluate(e.a, line)) && truthy(evaluate(e.b, line))
        if (e.op === 'or') return truthy(evaluate(e.a, line)) || truthy(evaluate(e.b, line))
        const a = evaluate(e.a, line)
        const b = evaluate(e.b, line)
        if (e.op === '==') return a === b
        if (e.op === '!=') return a !== b
        if (typeof a !== 'number' || typeof b !== 'number') throw new CodeError(line, `${e.op} only works with numbers.`)
        if (e.op === '<') return a < b
        if (e.op === '>') return a > b
        if (e.op === '<=') return a <= b
        if (e.op === '>=') return a >= b
        return e.op === '+' ? a + b : a - b
      }
    }
  }

  function move(args: Value[], line: number) {
    if (args.length > 1) throw new CodeError(line, 'robot.move() takes one number at most, like robot.move(3).')
    const squares = args[0] === undefined || args[0] === 'forward' ? 1 : args[0]
    if (typeof squares !== 'number' || !Number.isInteger(squares) || squares < 1)
      throw new CodeError(line, 'robot.move() takes a whole number of squares, like robot.move(2).')
    for (let i = 0; i < squares; i++) {
      tick(line)
      const next = ahead(robot, robot.dir)
      if (!inside(world, next))
        throw new CodeError(line, 'The robot reached the edge of the mat. Turn before moving, or move fewer squares.')
      if (world.walls.has(cellKey(next)))
        throw new CodeError(line, 'Bonk! There’s a wall in front of the robot. Turn before moving, or move fewer squares.')
      robot = { ...robot, ...next }
      trail.push(next)
      const key = cellKey(next)
      if (stars.has(key)) {
        stars.delete(key)
        collected.push(key)
      }
      snapshot(line)
    }
  }

  function turn(degrees: number, line: number) {
    robot = { ...robot, dir: turnDir(robot.dir, degrees / 90), angle: robot.angle + degrees }
    snapshot(line)
  }

  function turnAmount(args: Value[], line: number) {
    const [arg] = args
    if (arg === 'right') return 90
    if (arg === 'left') return -90
    if (typeof arg !== 'number' || arg === 0 || arg % 90 !== 0)
      throw new CodeError(line, 'The robot turns in quarter turns. Use robot.turn(90) for right or robot.turn(-90) for left.')
    return arg
  }

  function execute(body: Stmt[]) {
    for (const s of body) {
      tick(s.line)
      switch (s.t) {
        case 'cmd': {
          const args = s.args.map((a) => evaluate(a, s.line))
          if (s.name === 'move') move(args, s.line)
          else if (s.name === 'turn') turn(turnAmount(args, s.line), s.line)
          else turn(s.name === 'turn_left' ? -90 : 90, s.line)
          break
        }
        case 'print':
          output.push(format(evaluate(s.e, s.line)))
          snapshot(s.line)
          break
        case 'pass':
          break
        case 'for': {
          const count = evaluate(s.count, s.line)
          if (typeof count !== 'number' || !Number.isInteger(count) || count < 0)
            throw new CodeError(s.line, 'range() needs a whole number, like range(4).')
          for (let i = 0; i < count; i++) {
            vars.set(s.name, i)
            execute(s.body)
          }
          break
        }
        case 'while':
          while (truthy(evaluate(s.cond, s.line))) {
            tick(s.line)
            execute(s.body)
          }
          break
        case 'if': {
          const branch = s.branches.find((b) => b.cond === null || truthy(evaluate(b.cond, s.line)))
          if (branch) execute(branch.body)
          break
        }
      }
    }
  }

  snapshot(0)
  let error: CodeError | null = null
  try {
    execute(parse(source))
  } catch (e) {
    if (!(e instanceof CodeError)) throw e
    error = e
  }
  return { frames, trail, collected, output, error }
}
