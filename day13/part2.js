//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

// entry point
try {
  (async () => {
    const lines = await readLines(INPUT_FILE);
    if (lines) {
      const res = main(lines);
      // Read manually from output
      console.table(res);
    } else {
      console.log('No data found... :(');
    }
  })();
} catch (err) {
  console.log(err);
}

const DOT = 1;
const EMPTY = 0;

// main code
function main(lines) {
  const [dotMatrix, foldInstructions] = parseInputToDotMatrixAndFolds(lines);

  const foldedMatrix = foldInstructions.reduce(
    (matrix, instruction) =>
      foldMatrixAlongCoordinates(
        matrix,
        instruction[0] === 'x' ? instruction[1] : 0,
        instruction[0] === 'y' ? instruction[1] : 0
      ),
    dotMatrix
  );

  return foldedMatrix;
}

// execute fold along an axis point
const foldMatrixAlongCoordinates = (matrix, foldPointX, foldPointY) => {
  const startingPointX = foldPointX > 0 ? foldPointX + 1 : 0;
  const startingPointY = foldPointY > 0 ? foldPointY + 1 : 0;
  const maxY = matrix.length;
  const maxX = matrix[0].length;

  let yOffset = 0;
  for (let y = startingPointY; y < maxY; y++) {
    yOffset -= foldPointY > 0 ? 2 : 0;
    let xOffset = 0;
    for (let x = startingPointX; x < maxX; x++) {
      xOffset -= foldPointX > 0 ? 2 : 0;
      if (matrix[y][x] === DOT) {
        matrix[y + yOffset][x + xOffset] = DOT;
      }
    }
  }

  return matrix
    .slice(0, foldPointY > 0 ? foldPointY : maxY)
    .map((line) => line.slice(0, foldPointX > 0 ? foldPointX : maxX));
};

// parse input
const INSTRUCTIONS_PREFIX = 'fold along ';
const parseInputToDotMatrixAndFolds = (lines) => {
  // extract input info
  const dotsCoordinates = [],
    instructions = [];
  lines.forEach((line) => {
    if (line.indexOf(INSTRUCTIONS_PREFIX) === -1) {
      // coordinate
      dotsCoordinates.push(line.split(',').map((c) => +c));
    } else {
      // fold instruction
      instructions.push(
        line
          .replace(INSTRUCTIONS_PREFIX, '')
          .split('=')
          .map((n, idx) => (idx === 1 ? +n : n))
      );
    }
  });

  // map coordinates to matrix
  const maxX = Math.max.apply(
    null,
    dotsCoordinates.map((c) => c[0])
  );
  const maxY = Math.max.apply(
    null,
    dotsCoordinates.map((c) => c[1])
  );

  const dotMatrix = Array(maxY + 1)
    .fill(0)
    .map((_) => Array(maxX + 1).fill(EMPTY));
  dotsCoordinates.forEach((c) => (dotMatrix[c[1]][c[0]] = DOT));

  return [dotMatrix, instructions];
};
