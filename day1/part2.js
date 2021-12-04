const readLines = require('../utils/readLines');

const sum = (a, b) => a + b;

try {
  (async () => {
    const lines = await readLines('input.in');
    if (lines) {
      let count = 0;
      lines.reduce((previous, current) => {
        if (previous != null && previous.length === 3) {
          const tailValue = previous.shift();
          if (+current > tailValue) {
            count++;
          }
        }
        previous.push(+current);
        return previous;
      }, []);

      console.log(`Descended ${count} times`);
    } else {
      console.log('No data found...');
    }
  })();
} catch (err) {
  console.log(err);
}
