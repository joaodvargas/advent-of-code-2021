const INPUT_FILE = 'example.in';
//const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

// main code
async function main(fileLocation) {
  const input = await parseInput(fileLocation);
  const solution = solve(input);
  console.log(`The value you are looking for is ${solution}`);
}

// operate on input to solve problem
const solve = (input) => {
  // ...
  return 42;
};

// read file input into data structure(s)
const parseInput = async (fileLocation) => {
  const lines = await readLines(fileLocation);
  if (!lines) {
    throw Exception('No data found... :(');
  }

  // parse lines
  // ...
};

// run
main(process.argv[2] || INPUT_FILE);
