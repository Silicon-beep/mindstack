import { Answers, Captioned, CodeBlock, ErrorCard, Flow, Pair, Recipe, RobotSnapshot, SameScale } from '../components/visuals'
import { allOf, collectStars, endAt, maxLines, reachGoal, usesFor, usesIf, usesWhile, visitAll } from '../robot/checks'
import { parseWorld } from '../robot/world'
import type { Lesson } from '../types'

// ---------------------------------------------------------------- 1. Algorithms are recipes

const lane = parseWorld(['>...G'])
const smallMat = parseWorld(['...', '...', '>..'])
const predictMat = parseWorld(['....', '....', '>...', '....'])
const aroundWall = parseWorld(['....', '.#G.', '>#..'])

export const algorithmsAreRecipes: Lesson = {
  id: 'algorithms-are-recipes',
  title: 'Algorithms are recipes',
  minutes: 8,
  goal: 'Write a list of steps that gets the robot to the flag.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'Steps, in order',
      frames: [
        {
          title: 'An algorithm is a recipe',
          text: 'A recipe is a list of small steps you follow in order. Computer scientists call a list like that an algorithm.',
          visual: <Recipe title="Toast" steps={['Put bread in the toaster', 'Push the lever down', 'Wait for the pop', 'Spread the butter']} />,
        },
        {
          title: 'The robot follows your steps exactly',
          text: 'Each line of code is one step. The robot does exactly what each line says, one line at a time, from top to bottom.',
          visual: (
            <Pair>
              <CodeBlock code={'robot.move()\nrobot.move()'} />
              <RobotSnapshot world={lane} program={'robot.move()\nrobot.move()'} />
            </Pair>
          ),
        },
        {
          title: 'Order changes the result',
          text: 'Same two steps, different order, different place. Moving and then turning is not the same as turning and then moving.',
          visual: (
            <Pair>
              <Captioned caption="move, then turn left">
                <RobotSnapshot world={smallMat} program={'robot.move()\nrobot.turn_left()'} />
              </Captioned>
              <Captioned caption="turn left, then move">
                <RobotSnapshot world={smallMat} program={'robot.turn_left()\nrobot.move()'} />
              </Captioned>
            </Pair>
          ),
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'Where will it stop?',
      intro: 'Read the code one line at a time and follow along on the mat with your finger.',
      prompt: 'Which square does the robot end on?',
      code: 'robot.move()\nrobot.move()\nrobot.turn_left()\nrobot.move()',
      visual: (
        <RobotSnapshot
          world={predictMat}
          marks={[
            { x: 2, y: 1, label: 'A' },
            { x: 3, y: 2, label: 'B' },
            { x: 2, y: 3, label: 'C' },
          ]}
        />
      ),
      options: [
        { text: 'Square A', correct: true, feedback: 'Yes! Two moves right, a quarter turn left so it faces up, then one move up.' },
        { text: 'Square B', feedback: 'Close. That would happen without the turn. robot.turn_left() makes it face up before the last move.' },
        { text: 'Square C', feedback: 'Not quite. turn_left turns the robot to face up, not down. Follow the steps once more.' },
      ],
    },
    {
      stage: 'do',
      kind: 'robot',
      title: 'Drive to the flag',
      intro: 'Add steps until the robot reaches the flag, then press Run. Try as many times as you like.',
      task: {
        world: lane,
        starter: 'robot.move()\n',
        chips: ['move'],
        check: reachGoal('The robot reached the flag. That list of steps is your first algorithm!'),
        hint: 'The flag is 4 squares away and each robot.move() goes 1 square. You can also write robot.move(4) to go 4 squares at once.',
        solution: 'robot.move()\nrobot.move()\nrobot.move()\nrobot.move()\n',
      },
    },
    {
      stage: 'build',
      kind: 'robot',
      title: 'Around the wall',
      intro: 'A wall is in the way. Plan a route around it, then write the steps.',
      task: {
        world: aroundWall,
        starter: '# Go up, across, then down to the flag\nrobot.turn_left()\n',
        chips: ['move', 'turnLeft', 'turnRight'],
        check: reachGoal('You planned a route and the robot followed it. Nice algorithm!'),
        hint: 'Go up 2 squares, then right 2, then down 1. turn_right turns the robot clockwise.',
        solution: 'robot.turn_left()\nrobot.move(2)\nrobot.turn_right()\nrobot.move(2)\nrobot.turn_right()\nrobot.move()\n',
      },
    },
  ],
}

// ---------------------------------------------------------------- 2. Find the bug

const bugMat = parseWorld(['>..#', '....', '...G'])
const starMat = parseWorld(['>.*..', '....*', '..*..'])

export const findTheBug: Lesson = {
  id: 'find-the-bug',
  title: 'Find the bug',
  minutes: 9,
  goal: 'Read an error message, find the line that causes it and fix it.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'Bugs are normal',
      frames: [
        {
          title: 'Every programmer writes bugs',
          text: 'A bug is a mistake in code. Professional programmers write them every day. The real skill is finding them quickly.',
          visual: <CodeBlock code={'robot.move()\nrobot.mvoe()\nrobot.move()'} highlight={[2]} />,
        },
        {
          title: 'The message points to the line',
          text: 'When something goes wrong, MindStack tells you which line and what happened. Start your search there.',
          visual: <ErrorCard line={2} message="The robot doesn’t know “mvoe”. Did you mean robot.move()?" />,
        },
        {
          title: 'Change one thing, then run again',
          text: 'Fix one line, press Run and look at what changed. Small changes make it easy to tell what worked.',
          visual: <Flow steps={['Run', 'Read the message', 'Fix one line']} loop />,
        },
      ],
    },
    {
      stage: 'do',
      kind: 'robot',
      title: 'Fix the wrong turn',
      intro: 'This program should reach the flag, but it crashes. Run it, read the message and fix the bug.',
      task: {
        world: bugMat,
        starter: 'robot.move(2)\nrobot.turn_left()\nrobot.move(2)\nrobot.turn_left()\nrobot.move()\n',
        chips: ['turnLeft', 'turnRight'],
        check: reachGoal('Bug fixed! The robot made it to the flag.'),
        hint: 'After the first two moves the robot needs to face down. Which way does turn_left point it?',
        solution: 'robot.move(2)\nrobot.turn_right()\nrobot.move(2)\nrobot.turn_left()\nrobot.move()\n',
      },
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'What does a typo do?',
      prompt: 'Line 2 has a typo. What happens when you press Run?',
      code: 'robot.move()\nrobot.trun_right()\nrobot.move()',
      options: [
        { text: 'The robot guesses what you meant and turns right', feedback: 'Computers never guess. They need the exact name.' },
        {
          text: 'The robot stays put and a message on line 2 suggests robot.turn_right()',
          correct: true,
          feedback: 'Exactly. MindStack checks every line before the robot moves, spots the typo and suggests the closest command it knows.',
        },
        { text: 'The robot skips line 2 and runs the rest', feedback: 'Computers don’t skip mistakes. The program stops so you can fix it.' },
      ],
    },
    {
      stage: 'build',
      kind: 'robot',
      title: 'Star collector',
      intro: 'Write a program that collects all three stars. Any route works. If it breaks, read the message and fix one thing at a time.',
      task: {
        world: starMat,
        starter: '# Collect all three stars\nrobot.move(2)\n',
        chips: ['move', 'turnLeft', 'turnRight'],
        check: collectStars('All three stars collected. You planned, tested and fixed it like a real programmer.'),
        hint: 'Grab the top star, carry on to the end of the row, then work your way down and back.',
        solution: '# Collect all three stars\nrobot.move(4)\nrobot.turn_right()\nrobot.move(2)\nrobot.turn_right()\nrobot.move(2)\n',
      },
    },
  ],
}

// ---------------------------------------------------------------- 3. How a loop works

const squareMat = parseWorld(['...', '...', '^..'])
const stairs = parseWorld(['.....', '...*.', '..*..', '.*...', '>....'])
const unrolled = Array(4).fill('robot.move(2)\nrobot.turn_right()').join('\n')
const looped = 'for i in range(4):\n    robot.move(2)\n    robot.turn_right()'

export const howALoopWorks: Lesson = {
  id: 'how-a-loop-works',
  title: 'How a loop works',
  minutes: 8,
  goal: 'Use a for loop to repeat steps instead of writing them out again.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'Spot the repeat',
      frames: [
        {
          title: 'This program repeats itself',
          text: 'To trace a square, the robot moves and turns, four times over. The same two lines appear again and again.',
          visual: (
            <Pair>
              <CodeBlock code={unrolled} highlight={[1, 2]} />
              <RobotSnapshot world={squareMat} program={unrolled} />
            </Pair>
          ),
        },
        {
          title: 'A loop says “do this 4 times”',
          text: 'for i in range(4): means “repeat the lines below 4 times”. Two lines of instructions now do the work of eight.',
          visual: (
            <Pair>
              <CodeBlock code={looped} highlight={[1]} />
              <RobotSnapshot world={squareMat} program={looped} />
            </Pair>
          ),
        },
        {
          title: 'Indented lines are inside the loop',
          text: 'The 4 spaces in front of a line put it inside the loop. A line without spaces runs once, after the loop has finished.',
          visual: (
            <CodeBlock
              code={'for i in range(4):\n    robot.move(2)       # repeats\n    robot.turn_right()  # repeats\nrobot.move()            # runs once'}
              highlight={[2, 3]}
            />
          ),
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'Inside or outside?',
      intro: 'Look closely at the spaces in front of each line.',
      prompt: 'How many times does the robot turn?',
      code: 'for i in range(3):\n    robot.move()\nrobot.turn_right()',
      options: [
        { text: '3 times', feedback: 'Look at line 3. It has no spaces in front, so it isn’t inside the loop.' },
        { text: 'Once', correct: true, feedback: 'Right. Only robot.move() is indented, so it repeats 3 times. The turn runs once, after the loop.' },
        { text: 'Never', feedback: 'Line 3 still runs. It just runs once, after the loop has finished.' },
      ],
    },
    {
      stage: 'do',
      kind: 'robot',
      title: 'Trace the square',
      intro: 'Make the robot trace a square and finish where it started, using a loop. Keep it to 4 lines or fewer.',
      task: {
        world: squareMat,
        starter: 'for i in range(4):\n    robot.move(2)\n',
        chips: ['move', 'turnRight', 'loop'],
        check: allOf(
          usesFor,
          maxLines(4, 'Try to fit it in 4 lines or fewer. The loop can do the repeating for you.'),
          visitAll(
            [
              { x: 0, y: 0 },
              { x: 2, y: 0 },
              { x: 2, y: 2 },
            ],
            '',
            'The robot needs to visit all four corners of the square.',
          ),
          endAt({ x: 0, y: 2 }, 'Square traced with a loop. Two lines did the work of eight!', 'Almost. The robot should finish back where it started.'),
        ),
        hint: 'Inside the loop the robot needs to move and then turn. Add robot.turn_right() under robot.move(2), with the same 4 spaces in front.',
        solution: `${looped}\n`,
      },
    },
    {
      stage: 'build',
      kind: 'robot',
      title: 'Climb the stairs',
      intro: 'The stars sit on a staircase. Work out the steps for one stair, then repeat them with a loop.',
      task: {
        world: stairs,
        starter: '# One stair: move, turn left, move, turn right\nfor i in range(3):\n    robot.move()\n',
        chips: ['move', 'turnLeft', 'turnRight', 'loop'],
        check: allOf(usesFor, collectStars('You found the pattern and looped it. That’s how programmers save time!')),
        hint: 'One stair is: move, turn left, move, turn right. Put all four lines inside the loop.',
        solution:
          '# One stair: move, turn left, move, turn right\nfor i in range(3):\n    robot.move()\n    robot.turn_left()\n    robot.move()\n    robot.turn_right()\n',
      },
    },
  ],
}

// ---------------------------------------------------------------- 4. Making decisions

const facingWall = parseWorld(['>#', '..'])
const corridor = parseWorld(['>...#', '.....', '...G.'])
const longWay = parseWorld(['>....', '####.', 'G....'])
const ifElse = 'if robot.front_is_clear():\n    robot.move()\nelse:\n    robot.turn_right()'

export const makingDecisions: Lesson = {
  id: 'making-decisions',
  title: 'Making decisions',
  minutes: 10,
  goal: 'Use if and else so the robot checks before it acts.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'Look before you move',
      frames: [
        {
          title: 'Robots can check things',
          text: 'robot.front_is_clear() asks a question: is the square in front empty? The answer is always True or False.',
          visual: (
            <Pair>
              <RobotSnapshot world={facingWall} />
              <Answers items={[['front_is_clear()', 'False']]} />
            </Pair>
          ),
        },
        {
          title: 'if runs lines only when the answer is True',
          text: 'Lines indented under if run only when its question is True. When it’s False, the robot skips them.',
          visual: <CodeBlock code={'if robot.front_is_clear():\n    robot.move()'} highlight={[1]} />,
        },
        {
          title: 'else is the backup plan',
          text: 'Lines under else run when the answer is False. Exactly one of the two plans runs, every time.',
          visual: <CodeBlock code={ifElse} highlight={[3, 4]} />,
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'Which plan runs?',
      prompt: 'The robot is facing a wall. What does it do?',
      code: ifElse,
      visual: <RobotSnapshot world={facingWall} />,
      options: [
        { text: 'It moves forward', feedback: 'The square in front is a wall, so front_is_clear() is False and the move is skipped.' },
        { text: 'It turns right', correct: true, feedback: 'Yes. The answer is False, so the else plan runs.' },
        { text: 'It moves and then turns', feedback: 'Only one plan runs: either the if lines or the else lines, never both.' },
      ],
    },
    {
      stage: 'do',
      kind: 'robot',
      title: 'Turn at the wall',
      intro: 'Move when the way is clear and turn when it isn’t. Finish the program so the robot reaches the flag.',
      task: {
        world: corridor,
        starter: 'for i in range(6):\n    if robot.front_is_clear():\n        robot.move()\n',
        chips: ['move', 'turnRight', 'ifElse'],
        check: allOf(usesIf, reachGoal('The robot checked, decided and reached the flag.')),
        hint: 'Add else: lined up with the if, then robot.turn_right() under it with 8 spaces in front.',
        solution: `for i in range(6):\n${ifElse.replace(/^/gm, '    ')}\n`,
      },
    },
    {
      stage: 'build',
      kind: 'robot',
      title: 'The long way round',
      intro: 'Steer the robot around the wall to the flag with a loop, if and else. Count how many moves and turns it needs.',
      task: {
        world: longWay,
        starter: '# Find the flag. The robot can check for walls.\nfor i in range(12):\n    robot.move()\n',
        chips: ['move', 'turnRight', 'ifElse', 'loop'],
        check: allOf(
          usesIf,
          visitAll([{ x: 0, y: 2 }], 'Your robot made its own decisions all the way to the flag!', 'The robot hasn’t reached the flag yet. Does the loop run enough times?'),
        ),
        hint: 'Inside the loop: if the front is clear, move. Otherwise, turn right. The robot needs 12 steps in total.',
        solution: `for i in range(12):\n${ifElse.replace(/^/gm, '    ')}\n`,
      },
    },
  ],
}

// ---------------------------------------------------------------- 5. Loops that wait

const hall = parseWorld(['>....#'])
const shortHall = parseWorld(['>.#'])
const longHall = parseWorld(['>......#'])
const predictHall = parseWorld(['>...#'])
const driveHall = parseWorld(['>.....#'])
const spiral = parseWorld(['>....', '####.', '..G#.', '.###.', '.....'])
const whileClear = 'while robot.front_is_clear():\n    robot.move()'

export const loopsThatWait: Lesson = {
  id: 'loops-that-wait',
  title: 'Loops that wait',
  minutes: 10,
  goal: 'Use a while loop to repeat steps until something changes.',
  screens: [
    {
      stage: 'see',
      kind: 'explain',
      title: 'Repeat until something changes',
      frames: [
        {
          title: 'Keep going while it’s True',
          text: 'A for loop repeats a set number of times. A while loop keeps repeating as long as its question is True. Here: as long as the way ahead is clear.',
          visual: (
            <div className="flex w-full max-w-[360px] flex-col gap-4">
              <CodeBlock code={whileClear} highlight={[1]} />
              <RobotSnapshot world={hall} program={whileClear} />
            </div>
          ),
        },
        {
          title: 'It asks before every repeat',
          text: 'Before each repeat, the loop asks its question again. As soon as the answer is False, it stops. If the answer is False the very first time, the lines inside never run.',
          visual: <Flow steps={['Is the front clear?', 'Yes: move']} loop />,
        },
        {
          title: 'Same code, any distance',
          text: 'The same two lines stop at the wall in a short hall and in a long one. You don’t count the squares: the loop works out how many repeats it needs.',
          visual: (
            <SameScale
              mats={[
                { caption: 'Short hall', world: shortHall, program: whileClear },
                { caption: 'Long hall', world: longHall, program: whileClear },
              ]}
            />
          ),
        },
      ],
    },
    {
      stage: 'do',
      kind: 'predict',
      title: 'How far does it go?',
      prompt: 'How many squares does the robot move?',
      code: whileClear,
      visual: <RobotSnapshot world={predictHall} />,
      options: [
        { text: '3 squares', correct: true, feedback: 'Yes. After 3 moves the wall is right in front, so front_is_clear() is False and the loop stops.' },
        { text: '4 squares', feedback: 'That would put the robot inside the wall. The loop asks before every move, so it stops when the wall is right in front.' },
        { text: 'It never stops', feedback: 'It does stop. Once the wall is right in front, front_is_clear() is False and the loop ends.' },
      ],
    },
    {
      stage: 'do',
      kind: 'robot',
      title: 'Drive to the wall',
      intro: 'Finish the loop so the robot drives up to the wall and stops right in front of it. Don’t count the squares: let the loop do it.',
      task: {
        world: driveHall,
        starter: '# Move until the wall is right in front\nwhile robot.front_is_clear():\n',
        chips: ['move'],
        check: allOf(
          usesWhile,
          endAt(
            { x: 5, y: 0 },
            'The robot stopped right in front of the wall, and you never told it how far. The loop worked it out.',
            'The robot should stop right in front of the wall.',
          ),
        ),
        hint: 'Under the while line, add robot.move() with 4 spaces in front. The loop repeats it for as long as the front is clear.',
        solution: `# Move until the wall is right in front\n${whileClear}\n`,
      },
    },
    {
      stage: 'build',
      kind: 'robot',
      title: 'Spiral to the flag',
      intro: 'The path to the flag spirals inwards. Keep the robot going until it reaches the flag: move when the way is clear, and turn right when it isn’t.',
      task: {
        world: spiral,
        starter: '# Keep going until the robot reaches the flag\nwhile not robot.at_goal():\n    robot.move()\n',
        chips: ['move', 'turnRight', 'ifElse'],
        check: allOf(usesWhile, reachGoal('The robot found its own way to the flag, and you didn’t count a single step. That’s what while is for!')),
        hint: 'Inside the loop, check before you move: if the front is clear, move. Otherwise, turn right. The “if / else” button adds those lines for you.',
        solution: `# Keep going until the robot reaches the flag\nwhile not robot.at_goal():\n${ifElse.replace(/^/gm, '    ')}\n`,
      },
    },
  ],
}

export const computerScienceLessons = [algorithmsAreRecipes, findTheBug, howALoopWorks, makingDecisions, loopsThatWait]
