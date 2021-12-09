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
  // parse height map
  const heightMap = lines.map((line) => [...line].map((h) => +h));

  // map limits
  const bottomY = 0,
    topY = heightMap.length - 1;
  const bottomX = 0,
    topX = heightMap[0].length - 1;

  // get position on map if within boundaries of it
  const getPositionIfValid = (x, y) =>
    x >= bottomX && x <= topX && y >= bottomY && y <= topY
      ? heightMap[y][x]
      : Infinity;

  // find and sum if adjacent positions are all higher
  const sumOfRisk = heightMap.reduce((accTotal, line, y) => {
    const lineSum = line.reduce((accLine, cell, x) => {
      const adjacentPositions = [
        getPositionIfValid(x, y - 1),
        getPositionIfValid(x, y + 1),
        getPositionIfValid(x - 1, y),
        getPositionIfValid(x + 1, y),
      ];

      return (
        accLine + (adjacentPositions.every((p) => p > cell) ? cell + 1 : 0)
      );
    }, 0);

    return accTotal + lineSum;
  }, 0);

  return sumOfRisk;
}
