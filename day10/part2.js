//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

const SYMBOL_SCORE = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
};

const OPENING_SYMBOL_FOR_CLOSING_SYMBOL = {
  ')': '(',
  ']': '[',
  '}': '{',
  '>': '<',
};

const CLOSING_SYMBOL_FOR_OPENING_SYMBOL = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
};

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
  const closingSymbols = Object.keys(OPENING_SYMBOL_FOR_CLOSING_SYMBOL);
  const autoCompleteScores = [];

  lines.forEach((line) => {
    // parse line until its either found to be corrupt or we reach the end of the line
    const symbolStack = [];
    let isCorrupt = false;
    for (const char of [...line]) {
      if (closingSymbols.includes(char)) {
        // closing symbol?
        if (
          symbolStack[symbolStack.length - 1] ===
          OPENING_SYMBOL_FOR_CLOSING_SYMBOL[char]
        ) {
          // correct close, continue
          symbolStack.pop();
        } else {
          // corrupted line found, discard
          isCorrupt = true;
          break;
        }
      } else {
        // opening symbol?
        symbolStack.push(char);
      }
    }

    // if line is incomplete, complete and score it
    if (!isCorrupt && symbolStack.length > 0) {
      let score = 0;
      for (let index = symbolStack.length - 1; index >= 0; index--) {
        const missingClosingChar =
          CLOSING_SYMBOL_FOR_OPENING_SYMBOL[symbolStack[index]];
        score = score * 5 + SYMBOL_SCORE[missingClosingChar];
      }
      autoCompleteScores.push(score);
    }
  });

  // sort and pick middle value
  return autoCompleteScores.sort((a, b) => a - b)[
    Math.floor(autoCompleteScores.length / 2)
  ];
}
