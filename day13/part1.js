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
  const [dotMatrix, foldInstructions] = parseInputToDotMatrixAndFolds(lines);
  const firstInstruction = foldInstructions[0];

  const foldedMatrix = [firstInstruction].reduce(
    (matrix, instruction) =>
      foldMatrixAlongCoordinates(
        matrix,
        instruction[0] === 'x' ? instruction[1] : 0,
        instruction[0] === 'y' ? instruction[1] : 0
      ),
    dotMatrix
  );

  const dots = foldedMatrix.reduce(
    (acc, line) => acc + line.reduce((innerAcc, cell) => innerAcc + cell, 0),
    0
  );

  return dots;
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
      if (matrix[y][x] > 0) {
        matrix[y + yOffset][x + xOffset] = 1;
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
    .map((_) => Array(maxX + 1).fill(0));
  dotsCoordinates.forEach((c) => (dotMatrix[c[1]][c[0]] = 1));

  return [dotMatrix, instructions];
};
