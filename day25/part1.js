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

const EAST_CUCUMBER = '>';
const SOUTH_CUCUMBER = 'v';
const EMPTY_POSITION = '.';

const getMoveToPosition = (next, limit) =>
  next + 1 > limit - 1 ? 0 : next + 1;

// operate on input to solve problem
const solve = (cucumberMap) => {
  const limitX = cucumberMap[0].length,
    limitY = cucumberMap.length;

  let steps = 0;
  while (true) {
    let hasMoved = false;
    steps++;

    // move them 1 by 1 - east first, then south
    for (let y = 0; y < limitY; y++) {
      let ignoreEdge = false;
      for (let x = 0; x < limitX; x++) {
        if (cucumberMap[y][x] === EAST_CUCUMBER) {
          const next = getMoveToPosition(x, limitX);
          if (next === 0 && ignoreEdge) {
            continue;
          }
          if (cucumberMap[y][next] === EMPTY_POSITION) {
            cucumberMap[y][next] = EAST_CUCUMBER;
            cucumberMap[y][x] = EMPTY_POSITION;
            hasMoved = true;
            if (x === 0) {
              ignoreEdge = true;
            }
            x++;
          }
        }
      }
    }

    for (let x = 0; x < limitX; x++) {
      let ignoreEdge = false;
      for (let y = 0; y < limitY; y++) {
        if (cucumberMap[y][x] === SOUTH_CUCUMBER) {
          const next = getMoveToPosition(y, limitY);
          if (next === 0 && ignoreEdge) {
            continue;
          }
          if (cucumberMap[next][x] === EMPTY_POSITION) {
            cucumberMap[next][x] = SOUTH_CUCUMBER;
            cucumberMap[y][x] = EMPTY_POSITION;
            hasMoved = true;
            if (y === 0) {
              ignoreEdge = true;
            }
            y++;
          }
        }
      }
    }

    if (!hasMoved) {
      break;
    }
  }
  return steps;
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  return lines.map((l) => [...l]);
};

// run
main(process.argv[2] || INPUT_FILE);
