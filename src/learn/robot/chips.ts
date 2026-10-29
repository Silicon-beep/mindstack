// Tap-to-insert snippets shown above the robot editor, so learners can build code without typing it all.
export const CHIPS = {
  move: { label: 'move', code: 'robot.move()' },
  turnLeft: { label: 'turn left', code: 'robot.turn_left()' },
  turnRight: { label: 'turn right', code: 'robot.turn_right()' },
  loop: { label: 'for loop', code: 'for i in range(4):\n    robot.move()' },
  ifElse: { label: 'if / else', code: 'if robot.front_is_clear():\n    robot.move()\nelse:\n    robot.turn_right()' },
  printLight: { label: 'print light', code: 'print(robot.light())' },
} as const

export type ChipId = keyof typeof CHIPS
