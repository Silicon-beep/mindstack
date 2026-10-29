import { describe, expect, it } from 'vitest'
import { run } from './interpreter'
import { parseWorld } from './world'

const open = parseWorld(['...', '...', '^..'])
const last = (result: ReturnType<typeof run>) => result.frames[result.frames.length - 1].robot

describe('robot interpreter', () => {
  it('runs a for loop that traces a square back to the start', () => {
    const result = run('for i in range(4):\n    robot.move(2)\n    robot.turn_right()', open)
    expect(result.error).toBeNull()
    const end = last(result)
    expect([end.x, end.y, end.dir, end.angle]).toEqual([0, 2, 0, 360])
    expect(result.frames).toHaveLength(1 + 4 * 3) // start, then (2 moves + 1 turn) × 4
  })

  it('accepts the homepage snippet, where move("forward") is one square', () => {
    const result = run('for i in range(4):\n    robot.move("forward")\n    robot.turn(90)', open)
    expect(result.error).toBeNull()
    expect(last(result).angle).toBe(360)
  })

  it('points at a missing colon', () => {
    const { error } = run('for i in range(4)\n    robot.move()', open)
    expect(error?.line).toBe(1)
    expect(error?.message).toMatch(/colon/)
  })

  it('suggests the closest command for a typo', () => {
    expect(run('robot.move()\nrobot.trun_right()', open).error?.message).toMatch(/robot\.turn_right\(\)/)
  })

  it('stops at the edge of the mat and at walls', () => {
    expect(run('robot.move(3)', open).error?.message).toMatch(/edge/)
    expect(run('robot.move()', parseWorld(['>#'])).error?.message).toMatch(/wall/)
  })

  it('catches loops that never end', () => {
    expect(run('while True:\n    pass', open).error?.message).toMatch(/steps without finishing/)
  })

  it('reads sensors in conditions and print()', () => {
    const result = run('while not robot.on_line():\n    robot.move()\nprint(robot.light())', parseWorld(['>.=.']))
    expect(result.error).toBeNull()
    expect(last(result).x).toBe(2)
    expect(result.output).toEqual(['12'])
  })

  it('runs exactly one branch of if / elif / else', () => {
    const code = 'if robot.front_is_clear():\n    robot.move()\nelif robot.at_goal():\n    pass\nelse:\n    robot.turn_left()'
    expect(last(run(code, parseWorld(['>#']))).dir).toBe(0)
    expect(last(run(code, parseWorld(['>.']))).x).toBe(1)
  })

  it('explains indentation mistakes', () => {
    expect(run('for i in range(2):\nrobot.move()', open).error?.message).toMatch(/indented by 4 spaces/)
    expect(run('robot.move()\n    robot.move()', open).error?.line).toBe(2)
    expect(run('  robot.move()', open).error?.message).toMatch(/first line/)
  })

  it('follows a line with line_ahead / line_left / line_right', () => {
    const course = parseWorld(['.......', '..===..', '..=.=..', '..=.===', '===....', '.......'], {
      start: { x: 0, y: 4, dir: 1 },
      goal: { x: 6, y: 3 },
    })
    const code = [
      'while not robot.at_goal():',
      '    if robot.line_ahead():',
      '        robot.move()',
      '    elif robot.line_left():',
      '        robot.turn_left()',
      '    elif robot.line_right():',
      '        robot.turn_right()',
    ].join('\n')
    const result = run(code, course)
    expect(result.error).toBeNull()
    expect([last(result).x, last(result).y]).toEqual([6, 3])
  })
})
