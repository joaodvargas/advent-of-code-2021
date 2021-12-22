//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');
const { performance } = require('perf_hooks');

// main code
function main(filePath) {
  const startTime = performance.now();
  parseInput(filePath).then((input) => {
    const solution = solve(input);
    const endTime = performance.now();
    console.log(`The value you are looking for is ${solution}`);
    console.log(`Took ${Math.ceil(endTime - startTime)}ms to find it`);
  });
}

const MAX_BOUNDARY = 50;
// operate on input to solve problem
const solve = (cuboids) => {
  // naive implementation - map every cube with -50..50 space, starting as 0, as flip them

  const offSet = 50;
  const space = Array(101)
    .fill(0)
    .map((_) =>
      Array(101)
        .fill(0)
        .map((_) => Array(101).fill(0))
    );

  const validCuboids = cuboids
    .filter(
      (c) =>
        Math.abs(c.x1) <= MAX_BOUNDARY &&
        Math.abs(c.x2) <= MAX_BOUNDARY &&
        Math.abs(c.y1) <= MAX_BOUNDARY &&
        Math.abs(c.y2) <= MAX_BOUNDARY &&
        Math.abs(c.z1) <= MAX_BOUNDARY &&
        Math.abs(c.z2) <= MAX_BOUNDARY
    )
    .map((c) => ({
      ...c,
      x1: c.x1 + offSet,
      x2: c.x2 + offSet,
      y1: c.y1 + offSet,
      y2: c.y2 + offSet,
      z1: c.z1 + offSet,
      z2: c.z2 + offSet,
    }));

  let onCubesCount = 0;

  for (const cuboid of validCuboids) {
    for (let z = cuboid.z1; z <= cuboid.z2; z++) {
      for (let y = cuboid.y1; y <= cuboid.y2; y++) {
        for (let x = cuboid.x1; x <= cuboid.x2; x++) {
          const cube = space[z][y][x];
          if (cube === 1 && cuboid.value === 0) {
            onCubesCount--;
          } else if (cube === 0 && cuboid.value === 1) {
            onCubesCount++;
          }
          space[z][y][x] = cuboid.value;
        }
      }
    }
  }

  return onCubesCount;
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  // parse lines
  const cubes = lines.map((l) => {
    const res = {};
    // on or off
    if (l.indexOf('on ') > -1) {
      res.value = 1;
      l = l.substring(3);
    } else {
      res.value = 0;
      l = l.substring(4);
    }
    // x,y,z
    l = l.replace('x=', '').replace('y=', '').replace('z=', '');
    const axis = l.split(',');
    const [xvalues, yvalues, zvalues] = axis.map((a) => a.split('..'));

    res.x1 = +xvalues[0];
    res.x2 = +xvalues[1];
    res.y1 = +yvalues[0];
    res.y2 = +yvalues[1];
    res.z1 = +zvalues[0];
    res.z2 = +zvalues[1];

    return res;
  });

  return cubes;
};

// run
main(process.argv[2] || INPUT_FILE);
