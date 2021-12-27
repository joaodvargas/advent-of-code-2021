//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');
const { performance } = require('perf_hooks');

// main code
function main(filePath) {
  const startTime = performance.now();
  parseInput(filePath).then((input) => {
    const solution = part2(input);
    const endTime = performance.now();
    console.log(`The value you are looking for is ${solution}`);
    console.log(`Took ${Math.ceil(endTime - startTime)}ms to find it`);
  });
}

const MinHeap={siftDown(h,i=0,v=h[i]){if(i<h.length){let k=v[0];while(1){let j=i*2+1;if(j+1<h.length&&h[j][0]>h[j+1][0])j++;if(j>=h.length||k<=h[j][0])break;h[i]=h[j];i=j;}h[i]=v}},heapify(h){for(let i=h.length>>1;i--;)this.siftDown(h,i);return h},pop(h){return this.exchange(h,h.pop())},exchange(h,v){if(!h.length)return v;let w=h[0];this.siftDown(h,0,v);return w},push(h,v){let k=v[0],i=h.length,j;while((j=(i-1)>>1)>=0&&k<h[j][0]){h[i]=h[j];i=j}h[i]=v;return h}}; // prettier-ignore

const TYPES = 'ABCD'.split('');
const COSTS = [1, 10, 100, 1000];
const ROOM_AT = [3, 5, 7, 9].map((v) => v - 1);

const part1 = (lines) => {
  const queue = [
    [0, lines.slice(1, -1).map((row) => row.split('').slice(1, -1))],
  ];
  const visited = new Map();

  while (queue.length) {
    const [cost, grid] = MinHeap.pop(queue);

    if (
      ROOM_AT.every((x, t) => grid.slice(1).every((row) => row[x] === TYPES[t]))
    )
      return cost;

    let done = false;
    let hallwayItemsCost = 0;
    while (!done) {
      const tempCost = grid[0]
        .map((c, x) => [TYPES.indexOf(c), x])
        .filter(([t]) => t >= 0)
        // home is only occupied of correct types?
        .filter(([t]) =>
          grid.every(
            (row, i) =>
              i == 0 || row[ROOM_AT[t]] === TYPES[t] || row[ROOM_AT[t]] === '.'
          )
        )
        // clear path?
        .filter(([t, x]) =>
          grid[0]
            .slice(1 + Math.min(x, ROOM_AT[t]), Math.max(x, ROOM_AT[t]))
            .every((c) => c === '.')
        )
        // move them all - okay to mutate the current state
        .map(([t, x]) => {
          const distx = Math.abs(x - ROOM_AT[t]);
          const disty = grid.filter(
            (row, i) => i > 0 && row[ROOM_AT[t]] === '.'
          ).length;
          grid[0][x] = '.';
          grid[disty][ROOM_AT[t]] = TYPES[t];
          return (distx + disty) * COSTS[t];
        })
        .reduce((sum, c) => sum + c, 0);
      done = tempCost === 0;
      hallwayItemsCost += tempCost;
    }
    // move out top items to hallway if there are items of wrong type in room
    // add a state for each top item for each reachable position in the hallway
    const top_items = TYPES.map((_, t) => t)
      .map((t) => [t, grid.slice(1).map((row) => row[ROOM_AT[t]])])
      .filter(([t, room]) => room.some((c) => c !== '.' && c !== TYPES[t]))
      .map(([t, room]) => [ROOM_AT[t], room.findIndex((c) => c !== '.')])
      .map(([x, depth]) => [TYPES.indexOf(grid[depth + 1][x]), [x, depth + 1]]);

    // if no top items, this could be the final state
    const newStates =
      hallwayItemsCost && top_items.length === 0
        ? [[hallwayItemsCost + cost, grid]]
        : [];

    // for each top item, if any, move out to reachable hallway positions
    top_items
      .reduce(
        (states, [type, [x, y]]) =>
          grid[0]
            .map((c, x) => [c, x])
            // available slots
            .filter(([c, x]) => !ROOM_AT.includes(x) && c === '.')
            .map(([, x]) => x)
            // clear hallway path ?
            .filter((h_x) =>
              grid[0]
                .slice(Math.min(x, h_x), 1 + Math.max(x, h_x))
                .every((c) => c === '.')
            )
            .reduce((states, h_x) => {
              const state = grid.map((row) => row.map((c) => c));
              state[0][h_x] = TYPES[type];
              state[y][x] = '.';
              const new_cost =
                hallwayItemsCost + cost + (Math.abs(h_x - x) + y) * COSTS[type];
              return [...states, [new_cost, state]];
            }, states),
        newStates
      )
      .map(([cost, state]) => [state.join(), cost, state])
      .filter(
        ([key, new_cost]) => !visited.has(key) || new_cost < visited.get(key)
      )
      .forEach(([key, new_cost, state]) => {
        visited.set(key, new_cost);
        MinHeap.push(queue, [new_cost, state]);
      });
  }
};

const part2 = (lines) =>
  part1(
    lines
      .slice(0, 3)
      .concat('  #D#C#B#A#  ', '  #D#B#A#C#  ')
      .concat(lines.slice(3))
  );

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }
  return lines;
};

// run
main(process.argv[2] || INPUT_FILE);
