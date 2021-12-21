//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

// main code
function main(filePath) {
  parseInput(filePath).then((input) => {
    const solution = solve(input);
    console.log(`The value you are looking for is ${solution}`);
  });
}

const WIN_SCORE = 1000;

// operate on input to solve problem
const solve = ([player1Start, player2Start]) => {
  const playersPosition = [player1Start, player2Start];
  const playersPoints = [0, 0];

  let nextPlayer = 0;
  let totalRounds = 0;
  while (true) {
    totalRounds++;
    const dieRoll = rollDie(3);
    const playerIdx = nextPlayer;
    nextPlayer = 1 - nextPlayer;

    playersPosition[playerIdx] =
      (playersPosition[playerIdx] + (dieRoll % 10)) % 10;

    // correct final position of 0 to 10
    if (playersPosition[playerIdx] === 0) {
      playersPosition[playerIdx] = 10;
    }

    playersPoints[playerIdx] += playersPosition[playerIdx];

    // gg?
    if (playersPoints[playerIdx] >= WIN_SCORE) {
      break;
    }
  }

  return playersPoints[nextPlayer] * totalRolls;
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

// die rolls
const MIN_VALUE = 1;
const MAX_VALUE = 100;
let totalRolls = 0;
let nextValue = MIN_VALUE;
const rollDie = (nTimes) => {
  const value = Array(nTimes)
    .fill(0)
    .reduce((acc) => {
      if (nextValue > MAX_VALUE) {
        nextValue = 1;
      }
      return acc + nextValue++;
    }, 0);
  totalRolls += nTimes;

  return value;
};

// run
main(process.argv[2] || INPUT_FILE);
