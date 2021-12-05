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

  ventCoordinates.forEach((coordinates) => {
    if (coordinates.x1 === coordinates.x2) {
      const x = coordinates.x1;
      const startY = Math.min(coordinates.y1, coordinates.y2);
      const endY = Math.max(coordinates.y1, coordinates.y2);

      for (let y = startY; y <= endY; y++) {
        diagram[y][x]++;
      }
    } else if (coordinates.y1 === coordinates.y2) {
      const y = coordinates.y1;
      const startX = Math.min(coordinates.x1, coordinates.x2);
      const endX = Math.max(coordinates.x1, coordinates.x2);

      for (let x = startX; x <= endX; x++) {
        diagram[y][x]++;
      }
    }
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
