const INPUT_FILE = 'example.in';
//const INPUT_FILE = 'input.in';

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

const c1 = {
  x1: -3,
  x2: 3,
  y1: -3,
  y2: 3,
  z1: -3,
  z2: 3,
};

const c2 = {
  x1: 0,
  x2: 3,
  y1: 1,
  y2: 4,
  z1: -1,
  z2: 1,
};

// operate on input to solve problem
const solve = (cuboids) => {
  // tests
  console.log(doCuboidsCollide(c1, c2));
  console.log(doesCuboid1Contains2(c1, c2));
  console.log(doesCuboid1Contains2(c2, c1));
  return 42;
};

// https://stackoverflow.com/questions/28170413/intersection-between-two-boxes-in-3d-space
const cuboidsInterseection = (c1, c2) => {
  // ...
};

// https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection#aabb_vs._aabb
const doCuboidsCollide = (c1, c2) =>
  c1.x1 < c2.x2 &&
  c1.x2 > c2.x1 &&
  c1.y1 < c2.y2 &&
  c1.y2 > c2.y1 &&
  c1.z1 < c2.z2 &&
  c1.z2 > c2.z1;

const doesCuboid1Contains2 = (c1, c2) =>
  c1.x1 <= c2.x1 &&
  c1.x2 >= c2.x2 &&
  c1.y1 <= c2.y1 &&
  c1.y2 >= c2.y2 &&
  c1.z1 <= c2.z1 &&
  c1.z2 >= c2.z2;

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
