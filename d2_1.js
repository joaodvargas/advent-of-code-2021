const { isNumber } = require('util');
const readLines = require('./utils/readLines');
try {
  (async () => {
    const lines = await readLines('d2_1.input');
    if (lines) {
      const [horizontal, depth] = main(lines);
      console.log(
        `Finished at horizontal ${horizontal} and depth ${depth}, totalling ${
          horizontal * depth
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
  let horizontal = 0,
    depth = 0;

  const actions = {
    forward: (units) => (horizontal += units),
    down: (units) => (depth += units),
    up: (units) => (depth = Math.max(0, depth - units)),
  };

  lines.forEach((line) => {
    if (line) {
      const [action, units] = line.split(' ');

      // validate
      if (
        Object.keys(actions).indexOf(action.toLowerCase()) === -1 ||
        isNaN(units)
      ) {
        throw new Error(`Unexpected input: ${line}`);
      }

      actions[action.toLowerCase()](+units);
    }
  });

  return [horizontal, depth];
}
