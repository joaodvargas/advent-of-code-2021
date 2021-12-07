//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

// entry point
try {
  (async () => {
    const lines = await readLines(INPUT_FILE);
    if (lines) {
      const res = main(lines);
      console.log(`The value you are looking for is ${res}`);
    } else {
      console.log('No data found... :(');
    }
  })();
} catch (err) {
  console.log(err);
}

// main code
function main(lines) {
  const initCrabPositions = lines[0].split(',').map((n) => +n);
  //initCrabPositions.sort((a, b) => a - b);

  const average = Math.floor(
    initCrabPositions.reduce((acc, pos) => acc + pos, 0) /
      initCrabPositions.length
  );

  // start from mid point, upwards and downwards, until we reach consensus
  let optimalFuelSpent = calculateFuelToPoint(initCrabPositions, average);
  let nextUp = average + 1,
    nextDown = average - 1;
  let increasingUp = false,
    increasingDown = false;

  while (true) {
    if (increasingUp && increasingDown) {
      break;
    }
    if (!increasingUp) {
      const fuelSpent = calculateFuelToPoint(initCrabPositions, nextUp++);
      if (fuelSpent < optimalFuelSpent) {
        optimalFuelSpent = fuelSpent;
      } else {
        increasingUp = true;
      }
    }
    if (!increasingDown) {
      const fuelSpent = calculateFuelToPoint(initCrabPositions, nextDown--);
      if (fuelSpent < optimalFuelSpent) {
        optimalFuelSpent = fuelSpent;
      } else {
        increasingDown = true;
      }
    }
  }

  return optimalFuelSpent;
}

const calculateFuelToPoint = (crabs, position) =>
  crabs.reduce((acc, crab) => acc + Math.abs(crab - position), 0);
