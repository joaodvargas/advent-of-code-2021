//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

const STEPS = 40;

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

  const getPairFromString = (str, firstIndex) =>
    str[firstIndex] + str[firstIndex + 1];

  const createPolymerPair = () =>
    Object.keys(pairRules).reduce((pairs, key) => {
      pairs[key] = 0;
      return pairs;
    }, {});

  // initial pairs
  let polymerPairs = createPolymerPair();
  for (let index = 0; index < startingTemplate.length - 1; index++) {
    polymerPairs[getPairFromString(startingTemplate, index)] += 1;
  }

  // initial count
  const elementCount = Object.values(pairRules).reduce((elements, el) => {
    elements[el] = 0;
    return elements;
  }, {});
  [...startingTemplate].forEach(
    (element) => (elementCount[element] = (elementCount[element] || 0) + 1)
  );

  for (let step = 0; step < STEPS; step++) {
    // go through polymer in pairs of 2 and add result of rule in middle
    let newPolymerPairs = createPolymerPair();
    Object.keys(polymerPairs).forEach((pair) => {
      // for each pair, we get the same resulting element. Add it as many times as the pair appears
      const resultingElement = pairRules[pair];
      elementCount[resultingElement] += polymerPairs[pair];

      // update pair count2 in next iteration
      newPolymerPairs[pair[0] + resultingElement] += polymerPairs[pair];
      newPolymerPairs[resultingElement + pair[1]] += polymerPairs[pair];
    });

    // become the new starting point
    polymerPairs = newPolymerPairs;
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
