# Where the lesson facts come from

Every real-world claim in the lessons, and the source that backs it up. Last checked on 29 October 2026.

Claims about how MindStack itself behaves (the robot, its mats, the code editor, the neuron trainer) aren't listed here, because `npm test` checks those. When you add or change a lesson fact, check it with a web search and add the source here.

## Computer Science

### Algorithms are recipes

- **"Computer scientists call a list like that an algorithm."** Britannica defines an algorithm as a "procedure that produces the answer to a question or the solution to a problem in a finite number of steps." [Britannica](https://www.britannica.com/summary/algorithm)

### Find the bug

- **"A bug is a mistake in code."** IEEE: computer bugs are "unintended defects in software or hardware that cause a system to behave in ways that differ from its specification." [IEEE Technology Navigator](https://technav.ieee.org/topic/computer-bugs/)
- **"Professional programmers write them every day."** Data from Watts Humphrey's Personal Software Process found that experienced programmers make about one defect every 7–10 lines they write ([course text](https://ebooks.inflibnet.ac.in/csp8/chapter/personal-software-process), [gihyo.jp](https://gihyo.jp/admin/serial/01/pacific/200401)). Even finished software averages 15–50 defects per 1,000 lines, according to Steve McConnell's *Code Complete* as quoted in the New York Times ([Wikipedia](https://en.wikipedia.org/wiki/Steve_McConnell)). Both are secondhand reports of the original data.
- **"Fix one line, press Run… Small changes make it easy to tell what worked."** This is rule 5, "Change one thing at a time", of David Agans' *Debugging: The 9 Indispensable Rules*. [University of Washington slides](https://courses.cs.washington.edu/courses/cse466/15au/pdfs/lectures/DebuggingRules.pdf)
- **"Computers never guess"** and **"The program stops so you can fix it."** Python stops with an error instead of guessing. Since Python 3.10 it also suggests the name you probably meant ("Did you mean…?"), as MindStack does, but it doesn't run the suggestion. [Python 3.10: better error messages](https://docs.python.org/3/whatsnew/3.10.html#better-error-messages)

### How a loop works

- **`for i in range(4):` repeats the lines below 4 times.** The Python tutorial: "`range(10)` generates 10 values." [Python tutorial: range()](https://docs.python.org/3/tutorial/controlflow.html#the-range-function)
- **Indented lines are inside the loop, and 4 spaces is the indent.** Python groups statements by indentation instead of brackets ([Python design FAQ](https://docs.python.org/3/faq/design.html#why-does-python-use-indentation-for-grouping-of-statements)), and the style guide says "Use 4 spaces per indentation level" ([PEP 8](https://peps.python.org/pep-0008/#indentation)). Any consistent indent works in real Python and in MindStack; 4 spaces is the convention.

### Making decisions

- **"The answer is always True or False."** "The `bool` type has exactly two constant instances: `True` and `False`." [Python docs: bool](https://docs.python.org/3/library/stdtypes.html#boolean-type-bool)
- **`if` and `else`: exactly one plan runs.** Python checks the conditions in order and runs the block for the first one that's true; `else` runs when none are. [Python tutorial: if statements](https://docs.python.org/3/tutorial/controlflow.html#if-statements)

### Loops that wait

- **A while loop keeps repeating as long as its question is True, asks before every repeat, and might never run the lines inside.** Python's reference: the `while` statement "repeatedly tests the expression and, if it is true, executes the first suite; if the expression is false (which may be the first time it is tested)… the loop terminates." [Python reference: the while statement](https://docs.python.org/3/reference/compound_stmts.html#the-while-statement). The tutorial: "The while loop executes as long as the condition… remains true." [Python tutorial](https://docs.python.org/3/tutorial/introduction.html#first-steps-towards-programming)
- **A for loop repeats a set number of times.** See How a loop works: `range(10)` generates 10 values.

## Robotics

### Reading a light sensor

- **"It shines light down and measures how much bounces back up"** and **"a number from 0 to 100."** LEGO's EV3 Color Sensor, in reflected light mode, measures light reflected back from its own red lamp on a scale from 0 (very dark) to 100 (very light). [TeachEngineering EV3 lesson](https://www.teachengineering.org/content/umo_/lessons/umo_sensorswork/umo_sensorswork_lesson05_presentation_v2_tedl_ev3new.pdf), [ev3dev docs](https://python-ev3dev.readthedocs.io/en/ev3dev-jessie/sensors.html), [MathWorks: readLightIntensity](https://www.mathworks.com/help/matlab/supportpkg/readlightintensity.html)
- **"Bright floor reflects lots of light. Dark tape soaks it up."** Pololu's reflectance sensor (an infrared light plus a light detector) gives about 0.2 V over white and 3.8 V over black electrical tape; the higher voltage means less light came back. [Pololu QTR-L-1A](https://www.pololu.com/product/2454)
- **"That's how real robots use sensors."** LEGO Education's EV3 lessons teach the same thing: stop at a line using the light sensor, then follow it. [LEGO Education: Colors and lines](https://education.lego.com/en-us/lessons/ev3-robot-trainer/4-colors-and-lines/)

### Follow the line

- **Three light sensors that look down at the floor.** Real line-follower sensors face the floor from a few millimetres up, as with Pololu's ([Pololu QTR-L-1A](https://www.pololu.com/product/2454)), and line followers work by switching between two readings, line and no line ([LEGO Education](https://education.lego.com/en-us/lessons/ev3-robot-trainer/4-colors-and-lines/)). The lesson used to say the sensors were "pointing ahead, left and right", which could sound like they look sideways.
- **"elif means 'else, if'"** and **"runs the first plan whose answer is True."** The Python tutorial: "The keyword 'elif' is short for 'else if'." [Python tutorial: if statements](https://docs.python.org/3/tutorial/controlflow.html#if-statements)

## AI

### Teach a neuron

- **An artificial neuron multiplies each clue by a weight, adds them up with a bias, and answers yes when the total is above zero. On a chart its rule is a line. It learns by nudging its weights only when it gets one wrong.** This is the perceptron, Frank Rosenblatt's model from 1957–58. [University of Illinois slides](https://courses.grainger.illinois.edu/ECE448/sp2021/slides/lec08.pdf), [University of Utah lecture](https://users.cs.utah.edu/~zhe/pdf/lec-10-perceptron-upload.pdf), [Harvey Mudd notes](https://pages.hmc.edu/ruye/MachineLearning/lectures/ch10/node4.html)
- **"About 11 presses sort every email."** Checked by running the trainer's own rule on this lesson's emails: it takes exactly 11 presses.

### Why training data matters

- **A model learns from training examples, and the fair test is examples it never trained on.** Google's Machine Learning Crash Course: a training set is what "the model trains on", "You should test a model against a different set of examples than those used to train the model", and "The only fair test of a model is against new examples". [Google: dividing the dataset](https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets)
- **One-sided examples teach the wrong lesson.** The same course calls this coverage bias: it "occurs if data is not selected in a representative fashion". [Google: types of bias](https://developers.google.com/machine-learning/crash-course/fairness/types-of-bias)
- **What this neuron learns** (size counts for a lot and bumpiness for almost nothing, a big smooth apple is called an orange, all four new fruit are wrong, and adding big apples and small oranges fixes it) is checked by `npm test`, which runs the lesson's own data through the trainer.

### When the neuron gets it wrong

- **A false alarm (false positive) and a miss (false negative).** Google's Machine Learning Crash Course, with the same spam example: a false positive is "A not-spam email misclassified as spam", and a false negative is "A spam email misclassified as not-spam". [Google: thresholds and the confusion matrix](https://developers.google.com/machine-learning/crash-course/classification/thresholding)
- **A stricter filter catches more spam but makes more false alarms, and a more relaxed one the opposite.** The same page: raising the threshold means fewer emails flagged as spam, so fewer false positives but more false negatives, and lowering it does the reverse. [Google: thresholds](https://developers.google.com/machine-learning/crash-course/classification/thresholding)
- **Which mistake matters more depends on the job.** In most real uses "one kind of mistake (FN or FP) is more costly than the other", and for spam "it often makes sense to prioritize recall… or precision… or some balance of the two". [Google: accuracy, precision and recall](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall)
- **"No straight line can sort all 12 of these."** Checked by `npm test`, which tries every line the sliders can make on the lesson's emails. The best sorts 10.

### Many neurons make a network

- **One neuron can only draw one straight line, and some groups can't be split by one.** A single neuron's rule (w1 × x + w2 × y + bias above zero) is a straight line; see the perceptron notes under Teach a neuron. Google's Machine Learning Crash Course shows data where "A linear function cannot cleanly separate all the blue dots from the orange dots", and says neural networks are "designed to find nonlinear patterns in data". [Google: neural networks](https://developers.google.com/machine-learning/crash-course/neural-networks)
- **Neurons pass answers on to other neurons, in layers.** The same course: "additional layers between the input layer and the output layer are called hidden layers", "the nodes in these layers are called neurons", and the next layer's neurons "are calculated using the hidden layer's neuron values". [Google: nodes and hidden layers](https://developers.google.com/machine-learning/crash-course/neural-networks/nodes-hidden-layers)
- **Real networks learn their weights in training.** The model "automatically learns the optimal feature crosses to perform on the input data". [Google: neural networks](https://developers.google.com/machine-learning/crash-course/neural-networks)
- **No straight line fences off just the spam, and the suspicious-email checker needs C to say yes when either neuron does.** Checked by `npm test`: no line the sliders can make sorts either set of emails (the best gets 9 of 10), and no position of the two lines sorts the checker with "both say yes".

## Software Engineering

### What a web page is made of

- **Opening tag, content, closing tag with a slash.** MDN: a typical element includes "an opening tag…, enclosed text content, and a closing tag." A few "void" elements, like `<img>`, have no closing tag. [MDN: Element](https://developer.mozilla.org/en-US/docs/Glossary/Element), [MDN: HTML](https://developer.mozilla.org/en-US/docs/Glossary/HTML)
- **Tags go inside tags.** [MDN: nesting lists](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul)
- **`<h1>` is the main heading, down to `<h6>`.** MDN: "six levels of section headings. `<h1>` is the highest section level and `<h6>` is the lowest." [MDN: h1–h6](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements)
- **A missing `</h1>` swallows the paragraph.** Checked in Chrome: `<h1>My robot <p>…</p>` puts the paragraph inside the heading.

### Style it with CSS

- **A rule is a selector, then a property and value on each line.** MDN: "`p` selects all the paragraphs… The line inside the curly braces is called a declaration – it sets a value for a specific property." [MDN: CSS basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Styling_the_content)
- **Every tag is a box; padding is inside, the border is the edge.** MDN: "Everything in CSS has a box around it." Padding sits around the content, and the border wraps the content and padding. [MDN: the box model](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model)
- **Text is black by default.** Checked in Chrome. (A default `<h1>` is 32px, so the "bigger than 40px" checklist item needs a change.)
- **tomato, lavender, teal, purple and green are CSS color names.** [MDN: named colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/named-color), checked in Chrome.
- **The dot in `.card` targets every tag with `class="card"`.** MDN: "`.index` will match any element that has `class="index"`." [MDN: class selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Class_selectors) The lesson used to say "the tag", as if there could only be one.
