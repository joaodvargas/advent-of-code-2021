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
const DAYS_UNTIL_BIRTH = 6;
const NEWBORN_DAYS_UNTIL_BIRTH = 8;
const SIMULATION_DAYS = 80;

// main code
function main(lines) {
  const initialLanternFish = lines[0].split(',').map((n) => +n);

  let daysLeft = SIMULATION_DAYS;
  let lanternFish = [...initialLanternFish];

  // 1 loop iteration per day, decrease days for spawning and add new fish
  while (daysLeft-- > 0) {
    const newFish = [];
    for (let idx = 0; idx < lanternFish.length; idx++) {
      if (lanternFish[idx]-- === 0) {
        newFish.push(NEWBORN_DAYS_UNTIL_BIRTH);
        lanternFish[idx] = DAYS_UNTIL_BIRTH;
      }
    }
    lanternFish = [...lanternFish, ...newFish];
  }

  return lanternFish.length;
}
