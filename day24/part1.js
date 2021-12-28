//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');
const { performance } = require('perf_hooks');

// main code
function main(filePath) {
  const startTime = performance.now();
  parseInput(filePath).then((input) => {
    const solution = solve(input);
    const endTime = performance.now();
    console.log(`The value you are looking for is ${solution}`);
    console.log(`Took ${Math.ceil(endTime - startTime)}ms to find it`);
  });
}

// ------
// Run --
// ------

const INPUT_NUMBER_SIZE = 14;
const INPUT_REPETITION = 18;

const solve = (instructions) => {
  // had to look up help, although I had reached the conclusion it had to be based on input.
  // It's a base 26 number, with repeats of instructions pushing and popping numbers based on the "div z 1 | 26" line
  // We can boil it down to simple expressions to determine the conditionals of how the push must match the pop, to eventually get back to 0
  // Formula is "prev_w + (arg2 in add x 5th line)" == "now_w - (arg2 in add y 15th line)"
  // NOTE: input is unique to everyone!
  // https://www.reddit.com/r/adventofcode/comments/rnejv5/comment/hps5hgw/?utm_source=share&utm_medium=web2x&context=3

  const resolveDigits = (prevAddY, currAddX) => {
    for (let previousDigit = 9; previousDigit > 0; previousDigit--) {
      for (let currentDigit = 9; currentDigit > 0; currentDigit--) {
        const pushed = previousDigit + prevAddY,
          popped = currentDigit - currAddX;
        if (pushed === popped) {
          return [previousDigit, currentDigit];
        }
      }
    }
    throw Error('Unable to resolve digits!');
  };

  const serialNumber = Array(INPUT_NUMBER_SIZE).fill(null);
  const stack = [];
  let digitPosition = 0;
  for (let idx = 0; idx < instructions.length; idx = idx + INPUT_REPETITION) {
    const inputInstructions = instructions.slice(idx, idx + INPUT_REPETITION);
    const isPush = +inputInstructions[4].arg2 === 1;

    if (isPush) {
      stack.push([digitPosition, +inputInstructions[15].arg2]);
    } else {
      const [prevPosition, prevValue] = stack.pop();
      const currentValue = +inputInstructions[5].arg2;

      const [prevDigit, currentDigit] = resolveDigits(prevValue, currentValue);
      serialNumber[prevPosition] = prevDigit;
      serialNumber[digitPosition] = currentDigit;
    }

    digitPosition++;
  }

  return serialNumber.join('');
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  // parse instructions
  return lines.map((l) => {
    const [op, arg1, arg2] = l.split(' ');
    return {
      op,
      arg1,
      arg2,
    };
  });
};

// run
main(process.argv[2] || INPUT_FILE);
