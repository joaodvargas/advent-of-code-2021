//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const LIGHT_PX = '#';
const DARK_PX = '.';
const LOG = false;

const readLines = require('../utils/readLines');

// main code
function main(filePath) {
  parseInput(filePath).then((input) => {
    const solution = solve(input);
    console.log(`The value you are looking for is ${solution}`);
  });
}

// operate on input to solve problem
const solve = ({ algorithm, image }) => {
  const getBinaryForPixel = getBinaryForPixelFunc(algorithm);
  let imageX = image[0].length;
  let imageY = image.length;
  let frame = image.map((img) => [...img]);

  const maxIterations = 50;
  let iterationCount = 0;
  printCroppedImage(frame, imageX, imageY);

  while (iterationCount++ < maxIterations) {
    // increase sizes
    imageX += 2;
    imageY += 2;
    const newFrame = buildEmptyFrame(imageY);
    const infinitePixel = getInfinitePixel(algorithm, iterationCount - 1);

    for (let y = 0; y < imageY; y++) {
      for (let x = 0; x < imageX; x++) {
        newFrame[y][x] = getBinaryForPixel(frame, x - 1, y - 1, infinitePixel);
      }
    }

    printCroppedImage(newFrame, imageX, imageY);
    frame = newFrame;
  }

  const litPixels = frame.reduce(
    (acc, line) =>
      acc + line.reduce((acc2, char) => acc2 + (char === LIGHT_PX ? 1 : 0), 0),
    0
  );

  return litPixels;
};

const buildEmptyFrame = (size) =>
  Array(size)
    .fill(0)
    .map(() => Array(size).fill(DARK_PX));

const getInfinitePixel = (algorithm, iterationCount) => {
  if (iterationCount === 0) {
    return DARK_PX;
  }
  if (algorithm[0] === '.') {
    return DARK_PX;
  }
  return iterationCount % 2 === 0 ? DARK_PX : LIGHT_PX;
};

const getBinaryForPixelFunc = (algorithm) => (image, x, y, infinitePixel) => {
  const getPixelFromImage = (y, x) =>
    (image[y] && image[y][x]) || infinitePixel;

  const pixelConcat =
    getPixelFromImage(y - 1, x - 1) +
    getPixelFromImage(y - 1, x) +
    getPixelFromImage(y - 1, x + 1) +
    getPixelFromImage(y, x - 1) +
    getPixelFromImage(y, x) +
    getPixelFromImage(y, x + 1) +
    getPixelFromImage(y + 1, x - 1) +
    getPixelFromImage(y + 1, x) +
    getPixelFromImage(y + 1, x + 1);

  const binary = [...pixelConcat]
    .map((c) => (c === DARK_PX ? '0' : '1'))
    .join('');
  const index = parseInt(binary, 2);
  const pixel = algorithm[index];
  return pixel;
};

const printCroppedImage = (frame, imageX, imageY) => {
  if (!LOG) {
    return;
  }

  for (let y = 0; y < imageY; y++) {
    console.log(frame[y].join(''));
  }
  console.log('--- Image end ---');
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  const [algorithm, ...image] = lines;

  return { algorithm, image };
};

// run
main(process.argv[2] || INPUT_FILE);
