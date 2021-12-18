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

  // velocities that fall within the respective boundaries, and during which steps they are on target
  const validXVelocityAndSteps = calculateValidXVelocity(bottomX, topX);
  const validYVelocityAndSteps = calculateValidYVelocity(bottomY, topY);

  // count axis velocities by the steps # they are valid against
  const mapXSteps = reduceVelocityToCountBySteps(validXVelocityAndSteps);
  const mapYSteps = reduceVelocityToCountBySteps(validYVelocityAndSteps);

  // go through the valid Y steps and multiply by the available X steps
  const uniqueVelocities = new Set();
  for (const [steps, velocitiesY] of Object.entries(mapYSteps)) {
    // check same step match in the X velocities
    let velocitiesX = mapXSteps[steps];
    if (velocitiesX != null) {
      for (let yIndex = 0; yIndex < velocitiesY.length; yIndex++) {
        for (let xIndex = 0; xIndex < velocitiesX.length; xIndex++) {
          uniqueVelocities.add(`${velocitiesX[xIndex]},${velocitiesY[yIndex]}`);
        }
      }
    }
    // then check if valid infinity steps
    velocitiesX = mapXSteps[Infinity];
    if (velocitiesX != null) {
      for (const [minSteps, infinityVelocitiesX] of Object.entries(
        velocitiesX
      )) {
        if (+steps >= +minSteps) {
          for (let yIndex = 0; yIndex < velocitiesY.length; yIndex++) {
            for (
              let xIndex = 0;
              xIndex < infinityVelocitiesX.length;
              xIndex++
            ) {
              uniqueVelocities.add(
                `${infinityVelocitiesX[xIndex]},${velocitiesY[yIndex]}`
              );
            }
          }
        }
      }
    }
  }

  return uniqueVelocities.size;
};

const reduceVelocityToCountBySteps = (velocities) =>
  velocities.reduce((acc, data) => {
    // handle infinity differently, provide how many distinct X velocity we have for each minimal steps
    if (data.maxSteps === Infinity) {
      acc[Infinity] = acc[Infinity] || {};
      acc[Infinity][data.minSteps] = acc[Infinity][data.minSteps] || [];
      acc[Infinity][data.minSteps].push(data.velocity);
    } else {
      // keep track of how many distinct X velocity work for each # steps
      for (
        let stepCount = data.minSteps;
        stepCount <= data.maxSteps;
        stepCount++
      ) {
        acc[stepCount] = acc[stepCount] || [];
        acc[stepCount].push(data.velocity);
      }
    }
    return acc;
  }, {});

// only handle positive, no negatives in example (so far)
const calculateValidXVelocity = (bottomX, topX) => {
  const validX = [];

  let initialVelocity = topX;
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

const calculateValidYVelocity = (bottomY, topY) => {
  const validY = [];
  const highestVelocityY = (bottomY + 1) * -1;
  let initialVelocity = bottomY;
  while (initialVelocity <= highestVelocityY) {
    let y = 0,
      stepCount = 1,
      minSteps = null;
    for (
      let velocity = initialVelocity;
      y >= bottomY;
      stepCount++, velocity--
    ) {
      y += velocity;
      if (y <= topY && minSteps == null) {
        // entered target
        minSteps = stepCount;
      }
      if (y + velocity - 1 < bottomY) {
        // next step we are out of bonds, stop here
        break;
      }
    }

    // valid position?
    if (minSteps != null) {
      validY.push({ velocity: initialVelocity, minSteps, maxSteps: stepCount });
    }
    initialVelocity++;
  }

  return validY;
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

// const solveTrajectory = (velocity, { bottomX, topX, bottomY, topY }) => {
//   let x = 0,
//     y = 0;
//   let velX = velocity.x,
//     velY = velocity.y;
//   let stepCount = 0;
//   while (true) {
//     stepCount++;
//     x += velX;
//     y += velY;

//     velX = Math.max(0, velX - 1);
//     velY -= 1;
//     console.log(`x: ${x}, y: ${y}`);
//     if (x >= bottomX && x <= topX && y >= bottomY && y <= topY) {
//       // reached target area
//       console.log(`Reached target at step ${stepCount}`);
//       break;
//     }
//     if (x < bottomX && velX == 0) {
//       console.log(`Not enough velocity to reach target area`);
//       break;
//     }
//     if (x > topX) {
//       console.log(`Overshot target area on the X axis at step ${stepCount}`);
//       break;
//     }
//     if (y < bottomY) {
//       console.log(`Overshoot target area on the Y axis at step ${stepCount}`);
//       break;
//     }
//   }
// };

// run
main(process.argv[2] || INPUT_FILE);
