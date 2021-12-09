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

  return readings.reduce((acc, { patterns, outputs }) => {
    const decodedSegments = mapMixedSegmentsToReal(patterns);
    return acc + decodeReadingOutput(decodedSegments, outputs);
  }, 0);
}

const mapMixedSegmentsToReal = (patterns) => {
  const decodedSegments = {};
  // we know these values because we order by segment size, and they have unique sizes
  const one = patterns.filter((p) => p.length === 2)[0];
  const four = patterns.filter((p) => p.length === 4)[0];
  const seven = patterns.filter((p) => p.length === 3)[0];
  const eight = patterns.filter((p) => p.length === 7)[0];

  // possible segments c & f
  const cf = one;
  // possible segments b & d
  const bd = removeCharactersFromString(four, cf);
  // determine 'a' by removing c & f
  decodedSegments.a = removeCharactersFromString(seven, cf);
  // possible segments e & g
  const eg = removeCharactersFromString(eight, cf + bd + decodedSegments.a);

  // From 0, 6 and 9 (segment size of 6) we get possibles c, d & e
  const segments069 = patterns.filter((p) => p.length === 6);
  const cde =
    removeCharactersFromString(segments069[0], segments069[1]) +
    removeCharactersFromString(segments069[1], segments069[2]) +
    removeCharactersFromString(segments069[2], segments069[0]);

  // determine 'c' & 'f' by matching cf & cde
  decodedSegments.f = removeCharactersFromString(cf, cde);
  decodedSegments.c = removeCharactersFromString(cf, decodedSegments.f);

  // determine 'b' & 'd' by matching bd & cde
  decodedSegments.b = removeCharactersFromString(bd, cde);
  decodedSegments.d = removeCharactersFromString(bd, decodedSegments.b);

  // determine 'e' & 'g' by matching eg & cde;
  decodedSegments.g = removeCharactersFromString(eg, cde);
  decodedSegments.e = removeCharactersFromString(eg, decodedSegments.g);

  return decodedSegments;
};

const removeCharactersFromString = (str, chars) =>
  [...chars].reduce((acc, c) => acc.replace(c, ''), str);

const MAP_SEGMENTS_TO_NUMBER = {
  abcefg: '0',
  cf: '1',
  acdeg: '2',
  acdfg: '3',
  bcdf: '4',
  abdfg: '5',
  abdefg: '6',
  acf: '7',
  abcdefg: '8',
  abcdfg: '9',
};

// transforms all outputs into their real number, and join them together
const decodeReadingOutput = (decodedSegments, outputs) => {
  // invert the decoded segments map since we will be matching on the "mixed" char to get the "real" one
  const decodeMap = Object.entries(decodedSegments).reduce((map, entry) => {
    const [key, value] = entry;
    map[value] = key;
    return map;
  }, {});

  const entryValue = outputs.reduce((acc, output) => {
    const decodedOutput = [...output].reduce(
      (value, digit) => value + decodeMap[digit],
      ''
    );
    const orderedDecodedOutput = [...decodedOutput]
      .sort((a, b) => a.localeCompare(b))
      .join('');
    return acc + MAP_SEGMENTS_TO_NUMBER[orderedDecodedOutput];
  }, '');

  return +entryValue;
};

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
