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

// operate on input to solve problem
const solve = (boundaries) => {
  const { bottomX, topX, bottomY, topY } = boundaries;

  // how many steps needed to reach the X boundary, order by the most we can get
  const maxStepCount = calculateValidXVelocity(bottomX, topX).sort(
    (v1, v2) => v2.maxSteps - v1.maxSteps
  )[0].maxSteps;

  const { maxYVelocity } = calculateHighestYVelocity(
    bottomY,
    topY,
    maxStepCount
  );

  return (maxYVelocity * (maxYVelocity + 1)) / 2;
};

const calculateHighestYVelocity = (bottomY, topY, maxSteps) => {
  // taking initial Y velocity of vY, after (vY * 2 + 1) steps, we are at position y = 0 with a vY of -vY-1
  // the absolute best case is we go so high, by the time we are back at 0 we are 1 step away from the bottomY
  // so start from that optimal and backtrack from there
  let maxYVelocity = (bottomY + 1) * -1;
  let stepCount = maxYVelocity * 2 + 2;
  let validValue = true;

  while (true) {
    if (validValue && stepCount < maxSteps) {
      // found it
      break;
    }
    validValue = true;
    maxYVelocity -= 1;
    stepCount = maxYVelocity * 2 + 1;
    let y = 0;
    let velocityY = -maxYVelocity - 1;
    while (true) {
      y += velocityY--;
      stepCount++;
      if (y <= topY && y >= bottomY) {
        // on target
        break;
      }
      if (y <= bottomY) {
        // overshot
        validValue = false;
        break;
      }
    }
  }

  return {
    maxYVelocity,
    stepCount,
  };
};

// only handle positive, no negatives in example (so far)
const calculateValidXVelocity = (bottomX, topX) => {
  const validX = [];

  let initialVelocity = Math.floor(topX / 3); // 3 steps at least, to go up, top, go down
  while (initialVelocity > 1) {
    let x = 0,
      stepCount = 1,
      minSteps = null;
    for (let velocity = initialVelocity; x <= topX; stepCount++, velocity--) {
      x += velocity;
      if (x >= bottomX && minSteps == null) {
        minSteps = stepCount;
      }
      if (x + velocity - 1 > topX || velocity == 0) {
        // next step we are out of bonds or stopped, stop here
        if (velocity == 0) {
          stepCount = Infinity;
        }
        break;
      }
    }

    // valid position?
    if (minSteps != null) {
      validX.push({ velocity: initialVelocity, minSteps, maxSteps: stepCount });
    }
    initialVelocity--;
  }

  return validX;
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  const [x1, x2, y1, y2] = lines[0].match(/-?\d+/g);

  return {
    bottomX: +x1,
    topX: +x2,
    bottomY: +y1,
    topY: +y2,
  };
};

// run
main(process.argv[2] || INPUT_FILE);
