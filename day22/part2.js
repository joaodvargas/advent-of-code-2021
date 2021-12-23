//const INPUT_FILE = 'example2.in';
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

// operate on input to solve problem
const solve = (initialCuboids) => {
  let finalCuboids = [];

  initialCuboids.forEach((cuboid, cuboidIdx) => {
    let cuboidsToAdd = [],
      cuboidsToRemove = [];

    for (let idx = 0; idx < finalCuboids.length; idx++) {
      const prevCuboid = finalCuboids[idx];
      if (doCuboidsShareCubes(cuboid, prevCuboid)) {
        cuboidsToRemove.push(prevCuboid);

        // all contained, we don't need to split anything
        if (doesCuboid1Contains2(cuboid, prevCuboid)) {
          continue;
        }
        const intersectionCuboid = getIntersectionCuboid(cuboid, prevCuboid);
        const newCuboids = carveOutCuboids(intersectionCuboid, prevCuboid);
        cuboidsToAdd = [...cuboidsToAdd, ...newCuboids];
      }
    }
    finalCuboids = finalCuboids.filter((fc) => !cuboidsToRemove.includes(fc));
    finalCuboids = finalCuboids.concat(cuboidsToAdd);
    if (cuboid.value === 1) {
      finalCuboids.push(cuboid);
    }
  });

  // reduce our final cuboids
  const value = finalCuboids.reduce((acc, fc) => acc + getCubesInCuboid(fc), 0);

  return value;
};

// split into non-touching cuboids around c1 (can't touch else cubes would be shared!)
const carveOutCuboids = (c1, cuboidToSplit) => {
  const resultingCuboids = [];
  const toSplit = { ...cuboidToSplit };
  // x plane
  if (toSplit.x2 > c1.x2) {
    resultingCuboids.push({ ...toSplit, x1: c1.x2 + 1 });
    toSplit.x2 = c1.x2;
  }
  if (c1.x1 > toSplit.x1) {
    resultingCuboids.push({ ...toSplit, x2: c1.x1 - 1 });
    toSplit.x1 = c1.x1;
  }
  // y plane
  if (toSplit.y2 > c1.y2) {
    resultingCuboids.push({ ...toSplit, y1: c1.y2 + 1 });
    toSplit.y2 = c1.y2;
  }
  if (c1.y1 > toSplit.y1) {
    resultingCuboids.push({ ...toSplit, y2: c1.y1 - 1 });
    toSplit.y1 = c1.y1;
  }
  // z plane
  if (toSplit.z2 > c1.z2) {
    resultingCuboids.push({ ...toSplit, z1: c1.z2 + 1 });
    toSplit.z2 = c1.z2;
  }
  if (c1.z1 > toSplit.z1) {
    resultingCuboids.push({ ...toSplit, z2: c1.z1 - 1 });
    toSplit.z1 = c1.z1;
  }

  return resultingCuboids;
};

// https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection#aabb_vs._aabb
const doCuboidsShareCubes = (c1, c2) =>
  c1.x1 <= c2.x2 &&
  c1.x2 >= c2.x1 &&
  c1.y1 <= c2.y2 &&
  c1.y2 >= c2.y1 &&
  c1.z1 <= c2.z2 &&
  c1.z2 >= c2.z1;

const doesCuboid1Contains2 = (c1, c2) =>
  c1.x1 <= c2.x1 &&
  c1.x2 >= c2.x2 &&
  c1.y1 <= c2.y1 &&
  c1.y2 >= c2.y2 &&
  c1.z1 <= c2.z1 &&
  c1.z2 >= c2.z2;

const getIntersectionCuboid = (c1, c2) => ({
  x1: Math.max(c1.x1, c2.x1),
  x2: Math.min(c1.x2, c2.x2),
  y1: Math.max(c1.y1, c2.y1),
  y2: Math.min(c1.y2, c2.y2),
  z1: Math.max(c1.z1, c2.z1),
  z2: Math.min(c1.z2, c2.z2),
});

const getCubesInCuboid = (c) =>
  (c.x2 - c.x1 + 1) * (c.y2 - c.y1 + 1) * (c.z2 - c.z1 + 1);

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  // parse lines
  const cubes = lines.map((l) => {
    let value = null;
    // on or off
    if (l.indexOf('on ') > -1) {
      value = 1;
      l = l.substring(3);
    } else {
      value = 0;
      l = l.substring(4);
    }
    // x,y,z
    l = l.replace('x=', '').replace('y=', '').replace('z=', '');
    const axis = l.split(',');
    const [xvalues, yvalues, zvalues] = axis.map((a) => a.split('..'));

    // additional
    return createCuboid(
      +xvalues[0],
      +xvalues[1],
      +yvalues[0],
      +yvalues[1],
      +zvalues[0],
      +zvalues[1],
      value
    );
  });

  return cubes;
};

const createCuboid = (x1, x2, y1, y2, z1, z2, value = 1) => {
  const cuboid = {
    x1,
    x2,
    y1,
    y2,
    z1,
    z2,
    value,
  };
  return cuboid;
};

// run
main(process.argv[2] || INPUT_FILE);
