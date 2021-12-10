//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

const SYMBOL_SCORE = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
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
  let syntaxErrorScore = 0;

  lines.forEach((line) => {
    const symbolStack = [];
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
          // corrupted line found, score and skip
          console.log(
            `Expected ${
              CLOSING_SYMBOL_FOR_OPENING_SYMBOL[
                symbolStack[symbolStack.length - 1]
              ]
            }, but found ${char} instead.`
          );
          syntaxErrorScore += SYMBOL_SCORE[char];
          break;
        }
      } else {
        // opening symbol?
        symbolStack.push(char);
      }
    }
  });

  return syntaxErrorScore;
}
