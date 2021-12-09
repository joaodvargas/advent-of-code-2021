//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

const BASIN_BOUNDARY = 9;

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
  // parse height map
  const heightMap = lines.map((line) => [...line].map((h) => +h));

  // map limits
  const bottomY = 0,
    topY = heightMap.length - 1;
  const bottomX = 0,
    topX = heightMap[0].length - 1;

  // navigates from an initial point across the whole basin
  const navigateBasin = (initX, initY) => {
    const coordinatesToCheckNext = [[initX, initY]];
    let basinSize = 0;

    while (coordinatesToCheckNext.length > 0) {
      const [x, y] = coordinatesToCheckNext.shift();
      if (heightMap[y][x] === BASIN_BOUNDARY) {
        continue;
      } else {
        const adjacentPositions = calculateAdjacentPositions(x, y);
        if (adjacentPositions.top !== BASIN_BOUNDARY) {
          coordinatesToCheckNext.push([x, y - 1]);
        }
        if (adjacentPositions.bottom !== BASIN_BOUNDARY) {
          coordinatesToCheckNext.push([x, y + 1]);
        }
        if (adjacentPositions.left !== BASIN_BOUNDARY) {
          coordinatesToCheckNext.push([x - 1, y]);
        }
        if (adjacentPositions.right !== BASIN_BOUNDARY) {
          coordinatesToCheckNext.push([x + 1, y]);
        }

        heightMap[y][x] = BASIN_BOUNDARY;
        basinSize++;
      }
    }

    return basinSize;
  };

  // get object will all 4 adjacent positions to a point
  const calculateAdjacentPositions = (x, y) => ({
    top: getPositionIfValid(x, y - 1),
    bottom: getPositionIfValid(x, y + 1),
    left: getPositionIfValid(x - 1, y),
    right: getPositionIfValid(x + 1, y),
  });

  // get position on map if within boundaries of it
  const getPositionIfValid = (x, y) =>
    x >= bottomX && x <= topX && y >= bottomY && y <= topY
      ? heightMap[y][x]
      : BASIN_BOUNDARY;

  // find all basin sizes
  const foundBasinSizes = [];

  for (let y = bottomY; y <= topY; y++) {
    for (let x = bottomX; x <= topX; x++) {
      if (heightMap[y][x] === BASIN_BOUNDARY) {
        continue;
      } else {
        foundBasinSizes.push(navigateBasin(x, y));
      }
    }
  }

  const orderedBasins = foundBasinSizes.sort((a, b) => b - a);
  return orderedBasins[0] * orderedBasins[1] * orderedBasins[2];
}
