const readLines = require('../utils/readLines');
try {
  (async () => {
    const lines = await readLines('input.in');
    if (lines) {
      let count = 0;
      lines.reduce((previous, current) => {
        if (previous != null && +current > previous) {
          count++;
        }
        return +current;
      }, null);

      console.log(`Descended ${count} times`);
    } else {
      console.log('No data found...');
    }
  })();
} catch (err) {
  console.log(err);
}
