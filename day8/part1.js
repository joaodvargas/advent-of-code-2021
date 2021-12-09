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
  const readings = parseInput(lines);
  // validate
  validateInput(readings);

  return countUniqueSegmentDigits(readings);
}

const UNIQUE_SIZED_SEGMENTS = [2, 4, 3, 7];
const countUniqueSegmentDigits = (readings) =>
  readings.reduce(
    (acc, { outputs }) =>
      acc +
      outputs.reduce(
        (innerAcc, out) =>
          innerAcc + (UNIQUE_SIZED_SEGMENTS.includes(out.length) ? 1 : 0),
        0
      ),
    0
  );

// returns an array, with an object per line with both the identified patterns and the 4 digit outputs
const parseInput = (lines) =>
  lines.map((line) => {
    const [patterns, output] = line.split('|');
    return {
      patterns: patterns.match(/\S+/g),
      outputs: output.match(/\S+/g),
    };
  });

const validateInput = (readings) => {
  if (
    readings.some(
      (reading) =>
        reading.patterns.length !== 10 || reading.outputs.length !== 4
    )
  ) {
    throw new Error('Unexpected input parsed.');
  }
};
