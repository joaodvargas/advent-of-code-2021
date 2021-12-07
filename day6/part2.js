//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');
var memoize = require('fast-memoize');

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
const DAYS_ELAPSED_UNTIL_BIRTH = 7;
const ADDITIONAL_NEWBORN_DAYS_ELAPSED_UNTIL_BIRTH = 2;
const SIMULATION_DAYS = 256;

// main code
function main(lines) {
  const initialLanternFish = lines[0].split(',').map((n) => +n);

  // optimize memoize by adjusting the simulation days as if every fish started as "6"
  return initialLanternFish.reduce(
    (acc, startingDay) =>
      acc +
      childrenFromFishStartingDay(
        SIMULATION_DAYS + DAYS_ELAPSED_UNTIL_BIRTH - startingDay - 1
      ),
    0
  );
}

const childrenFromFishStartingDay = memoize(function (firstDay) {
  if (firstDay < DAYS_ELAPSED_UNTIL_BIRTH) {
    return 1;
  } else {
    const newFishCount = Math.floor(firstDay / DAYS_ELAPSED_UNTIL_BIRTH);
    return Array(newFishCount)
      .fill()
      .reduce((acc, _, idx) => {
        // optimize memoize by adjusting the remaining days as if every fish started as "6" instead of "8"
        const nextFishFirstDay =
          firstDay -
          ADDITIONAL_NEWBORN_DAYS_ELAPSED_UNTIL_BIRTH -
          DAYS_ELAPSED_UNTIL_BIRTH * (idx + 1);
        return acc + childrenFromFishStartingDay(nextFishFirstDay);
      }, 1);
  }
});
