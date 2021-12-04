const LINE_SIZE = 12;
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

// init
try {
  (async () => {
    const lines = await readLines(INPUT_FILE);
    if (lines) {
      const [oxygen, CO2] = main(lines);
      console.log(
        `Calculated an oxygen rating of ${oxygen} and CO2 rating of ${CO2} for a total power consumption of ${
          oxygen * CO2
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
  const oxygenBits = reduceToLineFunc(1, 0)(lines);
  const CO2bits = reduceToLineFunc(0, 1)(lines);

  return [binaryStrArrayToNumber(oxygenBits), binaryStrArrayToNumber(CO2bits)];
}

function reduceToLineFunc(bitForOne, bitForZero) {
  return function (lines) {
    let candidateLines = [...lines];
    let bitIndex = 0;

    while (candidateLines.length > 1 && bitIndex < LINE_SIZE) {
      const midValue = candidateLines.length / 2.0;
      const oneCount = calculateOneOcurrences(candidateLines, bitIndex);

      const inclusiveOfBit = oneCount >= midValue ? bitForOne : bitForZero;

      candidateLines = candidateLines.reduce((acc, value) => {
        if (+value[bitIndex] === inclusiveOfBit) {
          acc.push(value);
        }
        return acc;
      }, []);

      bitIndex++;
    }

    if (candidateLines.length !== 1) {
      throw new Error('No suitable candidates found!');
    }

    return candidateLines[0];
  };
}

// calculate occurrences of "1" per position
function calculateOneOcurrences(lines, bitIndex) {
  return lines.reduce((acc, bits) => (+bits[bitIndex] !== 0 ? ++acc : acc), 0);
}

function binaryStrArrayToNumber(binaryArray) {
  let value = 0;
  const reverseStr = [...binaryArray].reverse();
  for (let idx = 0; idx < reverseStr.length; idx++) {
    if (+reverseStr[idx] !== 0) {
      value += Math.pow(2, idx);
    }
  }

  console.log(`${binaryArray} in decimal is ${value}`);

  return value;
}
