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

// boundaries
const BOTTOM_X = 0,
  TOP_X = 9,
  BOTTOM_Y = 0,
  TOP_Y = 9; // 10x10 grid
const FLASH_LEVEL = 9;
const RESET_LEVEL = 0;

function main(lines) {
  const grid = parseInputToGrid(lines);

  let stepCount = 0;
  let flashCount = 0;

  // main recursive func, ticks the octopus energy and if it flashes recursively calls itself for any adjacent.
  const tickOctopus = (octopus) => {
    // if already flashed this tick, skip
    if (octopus.isFlashing) {
      return;
    }

    if (octopus.energy === FLASH_LEVEL) {
      // highlighting!
      octopus.isFlashing = true;
      octopus.energy = RESET_LEVEL;
      flashCount++;
      // trigger adjacents
      getAdjacents(octopus.x, octopus.y).forEach((coordinate) =>
        tickOctopus(grid[coordinate.y][coordinate.x])
      );
    } else {
      octopus.energy++;
    }
  };

  while (true) {
    stepCount++;

    // reset flashing status
    flashCount = 0;
    for (let y = BOTTOM_Y; y <= TOP_Y; y++) {
      for (let x = BOTTOM_X; x <= TOP_X; x++) {
        grid[y][x].isFlashing = false;
      }
    }

    // tick each octopus
    for (let y = BOTTOM_Y; y <= TOP_Y; y++) {
      for (let x = BOTTOM_X; x <= TOP_X; x++) {
        // do things
        const octopus = grid[y][x];
        tickOctopus(octopus);
      }
    }

    if (flashCount === 100) {
      return stepCount;
    }
  }
}

// parse input to grid of octopuses
const parseInputToGrid = (lines) =>
  lines.map((line, y) =>
    [...line].map((energy, x) => ({
      x,
      y,
      energy: +energy,
      isFlashing: false,
    }))
  );

// get all valid adjacent positions to an octopus
const getAdjacents = (x, y) =>
  [
    { x: x - 1, y: y - 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y },
    { x: x + 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x - 1, y: y + 1 },
    { x: x - 1, y: y },
  ].filter((coordinates) => isValidCoordinates(coordinates));

// validate if a pair of (x,y) coordinates are valid
const isValidCoordinates = (coordinates) =>
  coordinates.x >= BOTTOM_X &&
  coordinates.x <= TOP_X &&
  coordinates.y >= BOTTOM_Y &&
  coordinates.y <= TOP_Y;
