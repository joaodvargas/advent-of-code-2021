const LINE_SIZE = 12;
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

try {
  (async () => {
    const lines = await readLines(INPUT_FILE);
    if (lines) {
      const [gamma, epsilon] = main(lines);
      console.log(
        `Calculated a gamma of ${gamma} and epsilon of ${epsilon} for a total power consumption of ${
          gamma * epsilon
        }`
      );
    } else {
      console.log('No data found... :(');
    }
  })();
} catch (err) {
  console.log(err);
}

function main(lines) {
  const oneOcurrences = Array(LINE_SIZE).fill(0);
  const totalCount = lines.length;

  // calculate occurrences of "1" per position
  lines.forEach((bits) => {
    if (bits.length != LINE_SIZE) {
      throw new Error('Unexpected line size');
    }

    for (let idx = 0; idx < bits.length; idx++) {
      if (+bits[idx] !== 0) {
        oneOcurrences[idx]++;
      }
    }
  });

  const gammaBits = Array(LINE_SIZE).fill(0);
  const epsilonBits = Array(LINE_SIZE).fill(0);

  // calculate if "1" occur more often to calculate value for gamma & epsilon
  oneOcurrences.forEach((value, index) => {
    const is1MoreFrequent = value > totalCount / 2.0;
    gammaBits[index] = is1MoreFrequent ? 1 : 0;
    epsilonBits[index] = is1MoreFrequent ? 0 : 1;
  });

  return [binaryArrayToNumber(gammaBits), binaryArrayToNumber(epsilonBits)];
}

function binaryArrayToNumber(binaryArray) {
  let value = 0;
  const reverseStr = [...binaryArray].reverse();
  for (let idx = 0; idx < reverseStr.length; idx++) {
    if (reverseStr[idx] !== 0) {
      value += Math.pow(2, idx);
    }
  }

  console.log(`${binaryArray} in decimal is ${value}`);

  return value;
}
