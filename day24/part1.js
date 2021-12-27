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
// Operations & Variables --
const getEmptyVariables = () => ({
  w: 0,
  x: 0,
  y: 0,
  z: 0,
});

const getOperator = (variables) => {
  const getVariableOrNumber = (b) => (isNaN(b) ? variables[b] : +b);
  return {
    inp: (a, b) => {
      variables[a] = b;
    },
    add: (a, b) => (variables[a] = variables[a] + getVariableOrNumber(b)),
    mul: (a, b) => (variables[a] = variables[a] * getVariableOrNumber(b)),
    div: (a, b) =>
      (variables[a] = Math.floor(variables[a] / getVariableOrNumber(b))),
    mod: (a, b) => (variables[a] = variables[a] % getVariableOrNumber(b)),
    eql: (a, b) =>
      (variables[a] = variables[a] === getVariableOrNumber(b) ? 1 : 0),
  };
};

// ------
// Run --
// ------

const INPUT_NUMBER_SIZE = 14;
const INPUT_REPETITION = 18;

const solve = (instructions) => {
  let inputNumber = Array(INPUT_NUMBER_SIZE).fill(9);
  let cachedResults = Array(INPUT_NUMBER_SIZE).fill(null);
  let validCacheIndex = -1;

  const advanceNumber = () => {
    // reset cache to best possible value
    validCacheIndex = INPUT_NUMBER_SIZE - 2;

    for (let idx = inputNumber.length - 1; idx >= 0; idx--) {
      if (inputNumber[idx] === 1) {
        inputNumber[idx] = 9;
        // clear cache as we move towards a new digit #, and move backwards on the valid cache index
        console.log(cachedResults);
        cachedResults[validCacheIndex--] = null;
      } else {
        inputNumber[idx]--;
        break;
      }
    }
  };

  while (true) {
    // check for possible cache
    const variables =
      cachedResults[validCacheIndex] != null
        ? { ...cachedResults[validCacheIndex] }
        : getEmptyVariables();
    const startingInstructionIndex = Math.max(
      0,
      (validCacheIndex + 1) * INPUT_REPETITION
    );
    const iterationOperations = getOperator(variables);
    let firstInputRead = true;

    for (let idx = startingInstructionIndex; idx < instructions.length; idx++) {
      const { op, arg1, arg2 } = instructions[idx];

      if (idx % INPUT_REPETITION === 0) {
        if (op !== 'inp') {
          throw Error(`Unexpected op at the input index: ${op}`);
        }
        // cache the value calculated up to this stage, unless this is the very first input we are reading
        if (!firstInputRead) {
          cachedResults[idx / INPUT_REPETITION - 1] = { ...variables };
        } else {
          firstInputRead = false;
        }
        // read input
        iterationOperations.inp(arg1, inputNumber[idx / INPUT_REPETITION]);
      } else {
        iterationOperations[op](arg1, arg2);
      }

      // console.log(`${op} ${arg1} ${arg2}`);
      // console.log(
      //   `w:${variables.w}, x:${variables.x}, y:${variables.y}, z:${variables.z}`
      // );
    }

    // console.log(
    //   `${inputNumber.join('')},` +
    //     `w:${variables.w}, x:${variables.x}, y:${variables.y}, z:${variables.z}`
    // );

    // Valid and highest
    if (variables.z === 0) {
      return inputNumber.join('');
    } else {
      advanceNumber();
    }
  }
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
