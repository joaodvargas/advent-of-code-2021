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

const WIN_SCORE = 21;

// track universe wins
let p1wins = 0;
let p2wins = 0;

// operate on input to solve problem
const solve = ([player1Start, player2Start]) => {
  rollDiracDie(player1Start, player2Start, 0, 0, 0, 1);

  return Math.max(p1wins, p2wins);
};

const rollDiracDie = (
  p1position,
  p2position,
  p1score,
  p2score,
  nextPlayer,
  accUniverses
) => {
  for (let idx = 0; idx < DIE_ROLLS.length; idx++) {
    const { res, combinations } = DIE_ROLLS[idx];
    if (nextPlayer === 0) {
      let newP1position = (p1position + res) % 10;
      if (newP1position === 0) {
        newP1position = 10;
      }
      const newP1score = p1score + newP1position;
      if (newP1score >= WIN_SCORE) {
        p1wins += accUniverses * combinations;
      } else {
        rollDiracDie(
          newP1position,
          p2position,
          newP1score,
          p2score,
          1,
          accUniverses * combinations
        );
      }
    } else {
      let newP2position = (p2position + res) % 10;
      if (newP2position === 0) {
        newP2position = 10;
      }
      const newP2score = p2score + newP2position;
      if (newP2score >= WIN_SCORE) {
        p2wins += accUniverses * combinations;
      } else {
        rollDiracDie(
          p1position,
          newP2position,
          p1score,
          newP2score,
          0,
          accUniverses * combinations
        );
      }
    }
  }
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  // parse lines
  return lines.map((l) => +l.slice(-1));
};

// possible die rolls results
const DIE_ROLLS = [
  { res: 3, combinations: 1 },
  { res: 4, combinations: 3 },
  { res: 5, combinations: 6 },
  { res: 6, combinations: 7 },
  { res: 7, combinations: 6 },
  { res: 8, combinations: 3 },
  { res: 9, combinations: 1 },
];

// run
main(process.argv[2] || INPUT_FILE);
