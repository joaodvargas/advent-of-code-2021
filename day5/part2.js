//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

// entry point
try {
  (async () => {
    const lines = await readLines(INPUT_FILE);
    if (lines) {
      const dangerCount = main(lines);
      console.log(`We found ${dangerCount} overlapping points.`);
    } else {
      console.log('No data found... :(');
    }
  })();
} catch (err) {
  console.log(err);
}

// main code
function main(lines) {
  const ventCoordinates = parseInputToMap(lines);
  const { x: maxX, y: maxY } = findMaxBoundaries(ventCoordinates);
  // build empty diagram
  const diagram = Array(maxY + 1)
    .fill(0)
    .map((row) => Array(maxX + 1).fill(0));

  // determine lines of clouds based on vectors
  ventCoordinates.forEach((coordinates) => {
    const xMove =
      coordinates.x2 > coordinates.x1
        ? 1
        : coordinates.x2 < coordinates.x1
        ? -1
        : 0;
    const yMove =
      coordinates.y2 > coordinates.y1
        ? 1
        : coordinates.y2 < coordinates.y1
        ? -1
        : 0;

    for (
      let x = coordinates.x1, y = coordinates.y1;
      x !== coordinates.x2 || y !== coordinates.y2;
      x += xMove, y += yMove
    ) {
      diagram[y][x]++;
    }

    // last point is missed from above loop, do it after
    diagram[coordinates.y2][coordinates.x2]++;
  });

  return countDangerCoordinates(diagram, 2);
}

// create map matrix from input
const parseInputToMap = (lines) =>
  lines.map((line) => {
    const coordinates = line.split(' -> ').map((pair) => pair.split(','));
    return {
      x1: +coordinates[0][0],
      y1: +coordinates[0][1],
      x2: +coordinates[1][0],
      y2: +coordinates[1][1],
    };
  });

const findMaxBoundaries = (ventCoordinates) => {
  const x = ventCoordinates.reduce(
    (prev, coordinates) => Math.max(prev, coordinates.x1, coordinates.x2),
    0
  );
  const y = ventCoordinates.reduce(
    (prev, coordinates) => Math.max(prev, coordinates.y1, coordinates.y2),
    0
  );
  return {
    x,
    y,
  };
};

const countDangerCoordinates = (diagram, dangerOverlap) => {
  let count = 0;
  for (let y = 0; y < diagram.length; y++) {
    for (let x = 0; x < diagram[0].length; x++) {
      if (diagram[y][x] >= dangerOverlap) {
        count++;
      }
    }
  }
  return count;
};
