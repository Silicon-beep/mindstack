import { Answers, Captioned, CodeBlock, LightScale, Pair, RobotSnapshot } from '../components/visuals'
import { allOf, endOnLine, printed, reachGoal, usesWhile } from '../robot/checks'
import { LIGHT_ON_FLOOR, LIGHT_ON_LINE, parseWorld } from '../robot/world'
import type { Lesson } from '../types'

// ---------------------------------------------------------------- 1. Reading a light sensor

const offTape = parseWorld(['>=.'])
const onTape = parseWorld(['.=.'], { start: { x: 1, y: 0, dir: 1 } })
const stripe = parseWorld(['>..=....'])
const stopMat = parseWorld(['>....=..'])

export const readingALightSensor: Lesson = {
  id: 'reading-a-light-sensor',
  title: 'Reading a light sensor',
  minutes: 12,
  goal: 'Read the light sensor and use its number to stop the robot on a line.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'How a robot sees light',
      frames: [
        {
          title: 'The sensor looks at the floor',
          text: 'Under the robot is a light sensor. It shines light down and measures how much bounces back up.',
          visual: (
            <Pair>
              <Captioned caption={`On the floor: ${LIGHT_ON_FLOOR}`}>
                <RobotSnapshot world={offTape} />
              </Captioned>
              <Captioned caption={`On the tape: ${LIGHT_ON_LINE}`}>
                <RobotSnapshot world={onTape} />
              </Captioned>
            </Pair>
          ),
        },
        {
          title: 'Bright floor, big number',
          text: `The sensor gives a number from 0 to 100. Bright floor reflects lots of light (${LIGHT_ON_FLOOR}). Dark tape soaks it up (${LIGHT_ON_LINE}). Anything under 50 counts as dark.`,
          visual: <LightScale />,
        },
        {
          title: 'Ask the sensor in code',
          text: 'robot.light() gives you the reading right now. print() shows it on screen, and robot.light() > 50 asks “is it bright here?”',
          visual: <CodeBlock code={'print(robot.light())\n\nwhile robot.light() > 50:\n    robot.move()'} />,
        },
      ],
    },
    {
      stage: 'do',
      kind: 'robot',
      title: 'Find the dark tape',
      intro: 'Drive onto the dark tape, then print what the sensor sees. The live reading under the mat changes as the robot moves.',
      task: {
        world: stripe,
        starter: 'robot.move()\nprint(robot.light())\n',
        chips: ['move', 'printLight'],
        showSensor: true,
        showConsole: true,
        check: printed(
          String(LIGHT_ON_LINE),
          `The sensor read ${LIGHT_ON_LINE} on the tape. Dark means a small number.`,
          'The robot hasn’t printed a reading on the tape yet. The tape is 3 squares away.',
        ),
        hint: 'Move 3 squares to land on the tape, then print. robot.move(3) does it in one line.',
        solution: 'robot.move(3)\nprint(robot.light())\n',
      },
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'Read the number',
      prompt: `The sensor says ${LIGHT_ON_LINE}. Where is the robot?`,
      visual: <LightScale marker={LIGHT_ON_LINE} />,
      options: [
        { text: 'On the dark tape', correct: true, feedback: 'Yes. A small number means little light came back, so the floor under the robot is dark.' },
        { text: 'On the bright floor', feedback: `Bright floor reflects lots of light, so it gives a big number like ${LIGHT_ON_FLOOR}.` },
        { text: 'You can’t tell from the number', feedback: 'You can! On this mat, anything under 50 is the dark tape.' },
      ],
    },
    {
      stage: 'build',
      kind: 'robot',
      title: 'Stop on the line',
      intro: 'Real robots don’t know how far away the line is. Use the sensor instead: keep moving while the floor is bright, and stop when it turns dark.',
      task: {
        world: stopMat,
        starter: '# Keep moving while the sensor sees bright floor\nwhile robot.light() > 50:\n',
        chips: ['move', 'printLight'],
        showSensor: true,
        check: allOf(
          usesWhile,
          endOnLine('The robot found the line on its own and stopped. That’s how real robots use sensors!', 'The robot should stop on the dark tape.'),
        ),
        hint: 'Under the while line, add robot.move() with 4 spaces in front. The loop repeats until the reading drops below 50.',
        solution: '# Keep moving while the sensor sees bright floor\nwhile robot.light() > 50:\n    robot.move()\n',
      },
    },
  ],
}

// ---------------------------------------------------------------- 2. Follow the line

const corner = parseWorld(['...', '==.', '.=.'], { start: { x: 1, y: 1, dir: 1 } })
const bend = parseWorld(['.....', '====.', '...=.', '...=.'], { start: { x: 0, y: 1, dir: 1 }, goal: { x: 3, y: 3 } })
const course = parseWorld(['.......', '..===..', '..=.=..', '..=.===', '===....', '.......'], {
  start: { x: 0, y: 4, dir: 1 },
  goal: { x: 6, y: 3 },
})
const followRight =
  'while not robot.at_goal():\n    if robot.line_ahead():\n        robot.move()\n    elif robot.line_right():\n        robot.turn_right()\n'

export const followTheLine: Lesson = {
  id: 'follow-the-line',
  title: 'Follow the line',
  minutes: 15,
  goal: 'Program a robot that follows a line on its own, around every bend.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'How line followers think',
      frames: [
        {
          title: 'Three sensors, three questions',
          text: 'This robot has light sensors pointing ahead, left and right. Each one answers a question: is there line over there?',
          visual: (
            <Pair>
              <RobotSnapshot world={corner} />
              <Answers
                items={[
                  ['line_ahead()', 'False'],
                  ['line_left()', 'False'],
                  ['line_right()', 'True'],
                ]}
              />
            </Pair>
          ),
        },
        {
          title: 'if, elif, else: pick one plan',
          text: 'elif means “else, if”. The robot checks each question in order and runs the first plan whose answer is True.',
          visual: (
            <CodeBlock code={'if robot.line_ahead():\n    robot.move()\nelif robot.line_left():\n    robot.turn_left()\nelif robot.line_right():\n    robot.turn_right()'} />
          ),
        },
        {
          title: 'Repeat until the flag',
          text: 'Put the plans inside while not robot.at_goal(): and the robot keeps deciding, step after step, until it reaches the flag.',
          visual: <CodeBlock code={'while not robot.at_goal():\n    # check the sensors, pick a plan'} highlight={[1]} />,
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'Which way at the corner?',
      prompt: 'line_ahead() is False and line_right() is True. What should the robot do?',
      visual: <RobotSnapshot world={corner} />,
      options: [
        { text: 'Turn right', correct: true, feedback: 'Yes. The line carries on to its right, so it turns to face it.' },
        { text: 'Keep going straight', feedback: 'There’s no line ahead, so going straight would drive off the line.' },
        { text: 'Turn left', feedback: 'line_left() would need to be True for that. The line is on the right.' },
      ],
    },
    {
      stage: 'do',
      kind: 'robot',
      title: 'Follow the bend',
      intro: 'This program follows a straight line but gets stuck at the bend. Add a plan for when the line turns right.',
      task: {
        world: bend,
        starter: 'while not robot.at_goal():\n    if robot.line_ahead():\n        robot.move()\n',
        chips: ['move', 'turnRight'],
        check: reachGoal('Round the bend and on to the flag!'),
        hint: 'Add elif robot.line_right(): lined up with the if, then robot.turn_right() under it with 8 spaces in front.',
        solution: followRight,
      },
    },
    {
      stage: 'build',
      kind: 'robot',
      title: 'Run the full course',
      intro: 'This course bends left as well as right. Finish the line follower so it handles both and stops at the flag.',
      task: {
        world: course,
        starter: followRight,
        chips: ['turnLeft', 'turnRight'],
        check: reachGoal('Your line follower ran the whole course on its own. That’s real robotics code!'),
        hint: 'The course also bends left. Add another elif that checks robot.line_left() and turns left.',
        solution: `${followRight}    elif robot.line_left():\n        robot.turn_left()\n`,
      },
    },
  ],
}

export const roboticsLessons = [readingALightSensor, followTheLine]
