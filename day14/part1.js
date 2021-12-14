//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

const STEPS = 10;

// main code
function main(filePath) {
  parseInput(filePath).then((input) => {
    const solution = solve(input);
    console.log(`The value you are looking for is ${solution}`);
  });
}

// operate on input to solve problem
const solve = (input) => {
  const [startingTemplate, pairRules] = input;

  //console.log(`Template: ${startingTemplate}`);

  let polymer = startingTemplate;
  const elementCount = {};

  // initial count
  [...polymer].forEach(
    (element) => (elementCount[element] = (elementCount[element] || 0) + 1)
  );

  for (let step = 0; step < STEPS; step++) {
    // go through polymer in pairs of 2 and add result of rule in middle
    let newPolymer = '';
    for (let index = 0; index < polymer.length - 1; index++) {
      const resultingElement =
        pairRules[polymer[index] + polymer[index + 1]] || '';
      // keep track of element count
      if (resultingElement) {
        elementCount[resultingElement] =
          (elementCount[resultingElement] || 0) + 1;
      }
      newPolymer += polymer[index] + resultingElement;
    }
    // add final element
    polymer = newPolymer + polymer[polymer.length - 1];
    //console.log(`After step ${step + 1}: ${polymer}`);
  }

  // get t
  const maxValue = Math.max.apply(null, Object.values(elementCount));
  const minValue = Math.min.apply(null, Object.values(elementCount));

  return maxValue - minValue;
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  // parse lines
  const template = lines.shift();

  const pairRules = lines.reduce((rules, pairRule) => {
    const [pair, insertedElement] = pairRule.split(' -> ');
    rules[pair] = insertedElement;
    return rules;
  }, {});

  return [template, pairRules];
};

// run
main(process.argv[2] || INPUT_FILE);
