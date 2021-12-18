const INPUT_FILE = 'example.in';
//const INPUT_FILE = 'input.in';
const LOG = false;
const log = (txt) => LOG && console.log(txt);

const readLines = require('../utils/readLines');

// main code
function main(filePath) {
  parseInput(filePath).then((input) => {
    const solution = solve(input);
    console.log(`The value you are looking for is ${solution}`);
  });
}

// operate on input to solve problem
const solve = (input) => {
  // traverseToExplode([[[[[9, 8], 1], 2], 3], 4]);
  let number = input[0];

  for (var nIndex = 1; nIndex < input.length; nIndex++) {
    number = sumNumbers(number, input[nIndex]);

    log('Sum: ' + reduceNumberToString(number));
    while (true) {
      // explode as many times as possible
      let didExplode = traverseToExplode(number);
      log('Exploded: ' + reduceNumberToString(number));

      while (didExplode) {
        didExplode = traverseToExplode(number);
        if (didExplode) {
          log('Exploded: ' + reduceNumberToString(number));
        }
      }

      // split as many times as possible
      let didSplit = traverseToSplit(number);
      if (didSplit) {
        log('Splits: ' + reduceNumberToString(number));
      }

      // if no split, it won't have exploded so we are done
      if (!didSplit) {
        break;
      }
    }
    log('Post Reduction: ' + reduceNumberToString(number));
  }

  console.log(`Final number: ${reduceNumberToString(number)}`);

  const numberMagnitude = calculateMagnitude(number);

  return numberMagnitude;
};

const calculateMagnitude = (rootNumber) => {
  const leftValue = isNaN(rootNumber[0])
    ? calculateMagnitude(rootNumber[0])
    : rootNumber[0];
  const rightValue = isNaN(rootNumber[1])
    ? calculateMagnitude(rootNumber[1])
    : rootNumber[1];

  return 3 * leftValue + 2 * rightValue;
};

const traverseToSplit = (rootNumber) => {
  let visitedNodes = [];
  let haveSplit = false;

  const getPairFromValue = (value) => [
    Math.floor(value / 2),
    Math.ceil(value / 2),
  ];

  const traverse = (node, depth) => {
    visitedNodes.push(node);
    if (Array.isArray(node[0])) {
      if (traverse(node[0], depth + 1)) {
        return true;
      }
    } else if (node[0] >= 10) {
      node[0] = getPairFromValue(node[0]);
      haveSplit = true;
      return true;
    }

    if (Array.isArray(node[1])) {
      if (traverse(node[1], depth + 1)) {
        return true;
      }
    } else if (node[1] >= 10) {
      node[1] = getPairFromValue(node[1]);
      haveSplit = true;
      return true;
    }
  };

  traverse(rootNumber, 0);
  return haveSplit;
};

const traverseToExplode = (rootNumber) => {
  let visitedNodes = [];
  let haveExploded = false;
  let lastLeftSideNumberArray = null;
  let lastLeftSideNumberArrayIndex = null;
  let addToNextFoundNumber = null;

  const traverse = (node, depth) => {
    visitedNodes.push(node);
    if (depth > 3 && !haveExploded && !isNaN(node[0]) && !isNaN(node[1])) {
      haveExploded = true;
      // explode!
      const parentNode = visitedNodes[visitedNodes.length - 2];
      if (parentNode[0] === node) {
        parentNode[0] = 0;
      } else {
        parentNode[1] = 0;
      }
      if (lastLeftSideNumberArray != null) {
        lastLeftSideNumberArray[lastLeftSideNumberArrayIndex] += node[0];
      }
      addToNextFoundNumber = node[1];
      return false;
    }

    if (Array.isArray(node[0])) {
      if (traverse(node[0], depth + 1)) {
        return true;
      }
    } else if (addToNextFoundNumber != null) {
      node[0] += addToNextFoundNumber;
      return true;
    } else {
      lastLeftSideNumberArray = node;
      lastLeftSideNumberArrayIndex = 0;
    }

    if (Array.isArray(node[1])) {
      if (traverse(node[1], depth + 1)) {
        return true;
      }
    } else if (addToNextFoundNumber != null) {
      node[1] += addToNextFoundNumber;
      return true;
    } else {
      lastLeftSideNumberArray = node;
      lastLeftSideNumberArrayIndex = 1;
    }
  };

  traverse(rootNumber, 0);
  return haveExploded;
};

const reduceNumberToString = (n) => {
  let str = '[';
  if (Array.isArray(n[0])) {
    str += reduceNumberToString(n[0]);
  } else {
    str += n[0];
  }
  str += ',';
  if (Array.isArray(n[1])) {
    str += reduceNumberToString(n[1]);
  } else {
    str += n[1];
  }

  return str + ']';
};

const sumNumbers = (n1, n2) => [n1, n2];

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  // parse lines
  return lines.map((l) => eval(l));
};

// run
main(process.argv[2] || INPUT_FILE);
