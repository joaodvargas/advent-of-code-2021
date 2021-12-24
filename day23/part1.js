//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');
const { performance } = require('perf_hooks');

// main code
function main(filePath) {
  const startTime = performance.now();
  parseInput(filePath).then((input) => {
    const solution = solve(input);
    const endTime = performance.now();
    console.log(`The value you are looking for is ${solution}`);
    console.log(`Took ${Math.ceil(endTime - startTime)}ms to find it`);
  });
}

// Amphipods
const AMPHIPODS_MOVE_ENERGY = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000,
};

// Space
const AMPHIPODS_ROOMS_X = {
  A: 2,
  B: 4,
  C: 6,
  D: 8,
};

const HALLWAY_LENGTH = 11;
const HALLWAY_Y = 0;
const FRONT_ROOM_Y = 1;
const BACK_ROOM_Y = 2;

let id = 0;
const buildPlayer = (type, x, y) => ({
  id: id++,
  type,
  x,
  y,
  stepEnergy: AMPHIPODS_MOVE_ENERGY[type],
  winX: AMPHIPODS_ROOMS_X[type],
  win: x === AMPHIPODS_ROOMS_X[type] && y === BACK_ROOM_Y,
});

// Rules & moves
const getRange = (x1, x2) =>
  Array(Math.abs(x2 - x1) + 1)
    .fill()
    .map((_, idx) => Math.min(x1, x2) + idx);

const getMoves = (playerId, players) => {
  const player = players[playerId];
  const otherPlayers = players.filter((_, idx) => idx !== playerId);

  // already won, stopped moving
  if (player.win) {
    return [];
  }

  // back of room and someone in front? can't move
  if (
    player.y === BACK_ROOM_Y &&
    otherPlayers.some((pp) => pp.x === player.x)
  ) {
    return [];
  }

  // get map of hallway
  const hallwayPlayers = otherPlayers.filter((p) => p.y === HALLWAY_Y);
  const hallway = Array(HALLWAY_LENGTH).fill(0);
  hallwayPlayers.forEach((p) => (hallway[p.x] = 1));

  // players in my target room?
  const targetRoomPlayers = otherPlayers.filter((p) => p.x === player.winX);

  // my room free? try to get there
  if (
    targetRoomPlayers.length === 0 ||
    (targetRoomPlayers.length === 1 &&
      targetRoomPlayers[0].type === player.type &&
      targetRoomPlayers[0].y === BACK_ROOM_Y)
  ) {
    const isPathBlocked = getRange(player.x, player.winX).reduce(
      (acc, x) => acc || hallway[x] > 0,
      false
    );
    if (!isPathBlocked) {
      // Win - only move we should do
      return [
        {
          id: player.id,
          x: player.winX,
          y: targetRoomPlayers.length > 0 ? FRONT_ROOM_Y : BACK_ROOM_Y,
          isWin: true,
          energy: getEnergySpentOnMove(
            player,
            player.winX,
            targetRoomPlayers.length > 0 ? FRONT_ROOM_Y : BACK_ROOM_Y
          ),
        },
      ];
    }
  }

  // middle of hallway can't get to my room? can't move
  if (player.y === HALLWAY_Y) {
    return [];
  }

  // check valid hallway moves - left and right
  const validHallwayPositions = [];
  const invalidHallwayPositions = Object.values(AMPHIPODS_ROOMS_X);
  for (let nextX = player.x - 1; nextX >= 0; nextX--) {
    if (invalidHallwayPositions.indexOf(nextX) >= 0) {
      continue;
    }
    if (hallway[nextX] > 0) {
      break;
    }
    validHallwayPositions.push(nextX);
  }
  for (let nextX = player.x + 1; nextX < hallway.length; nextX++) {
    if (invalidHallwayPositions.indexOf(nextX) >= 0) {
      continue;
    }
    if (hallway[nextX] > 0) {
      break;
    }
    validHallwayPositions.push(nextX);
  }

  return validHallwayPositions.map((x) => ({
    id: player.id,
    x,
    y: HALLWAY_Y,
    isWin: false,
    energy: getEnergySpentOnMove(player, x, HALLWAY_Y),
  }));
};

const getPossibleMovesForEveryPlayer = (players) => {
  let nextMoves = [];
  for (let p of players) {
    // initial moves
    const moves = getMoves(p.id, players);
    nextMoves = [...nextMoves, ...moves];
  }
  return nextMoves;
};

// helpers --
const getEnergySpentOnMove = (player, x, y) =>
  (Math.abs(player.x - x) + player.y + y) * player.stepEnergy;

// sort by wins first, spent energy 2nd
const addMoveToSortedIndex = (nextMoves, move) => {
  let low = 0,
    high = nextMoves.length;

  while (low < high) {
    let mid = (low + high) >>> 1;
    if (nextMoves[mid][3] === move[3]) {
      if (nextMoves[mid][1] < move[1]) {
        low = mid + 1;
      } else {
        high = mid;
      }
    } else if (nextMoves[mid][3] > move[3]) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  nextMoves.splice(low, 0, move);
};

const printBoard = (players) => {
  console.log('#############');
  const hallway = Array(HALLWAY_LENGTH).fill('.');
  players.forEach((p) => {
    if (p.y === HALLWAY_Y) {
      hallway[p.x] = p.type;
    }
  });
  const getOccupier = (x, y) =>
    (players.find((p) => p.x === x && p.y === y) || {}).type || '.';

  console.log(`#${hallway.join('')}#`);
  const roomDoor = `###${getOccupier(2, FRONT_ROOM_Y)}#${getOccupier(
    4,
    FRONT_ROOM_Y
  )}#${getOccupier(6, FRONT_ROOM_Y)}#${getOccupier(8, FRONT_ROOM_Y)}###`;
  console.log(roomDoor);
  const roomBack = `  #${getOccupier(2, BACK_ROOM_Y)}#${getOccupier(
    4,
    BACK_ROOM_Y
  )}#${getOccupier(6, BACK_ROOM_Y)}#${getOccupier(8, BACK_ROOM_Y)}#`;
  console.log(roomBack);
  console.log('  #########');
};

// operate on input to solve problem
// TODO: BUG - it never ends, I missed some condition to stop it from calculating new moves!!!
const solve = ([roomDoor, roomBack]) => {
  // setup
  const initialPlayers = roomDoor
    .map((p, idx) => buildPlayer(p, 2 + idx * 2, FRONT_ROOM_Y))
    .concat(roomBack.map((p, idx) => buildPlayer(p, 2 + idx * 2, BACK_ROOM_Y)));

  // initial moves
  const initMoves = getPossibleMovesForEveryPlayer(initialPlayers);
  const nextMoves = initMoves
    .map((m) => [m, m.energy, initialPlayers, 0])
    .sort((a, b) => a[1] - b[1]);

  let minEnergyToWin = Infinity;
  // go through looking for win conditions
  while (nextMoves.length > 0) {
    // do move
    const [nextMove, accEnergy, players, wins] = nextMoves.shift();

    // create new players array for move
    let playerThatMoved = players[nextMove.id];
    playerThatMoved = {
      ...playerThatMoved,
      x: nextMove.x,
      y: nextMove.y,
      win: nextMove.isWin,
    };
    const newPlayers = [...players];
    newPlayers[playerThatMoved.id] = playerThatMoved;

    // possible win
    if (nextMove.isWin && newPlayers.every((p) => p.win)) {
      // end!
      if (accEnergy < minEnergyToWin) {
        minEnergyToWin = accEnergy;
        console.log(`Found new min for energy to win: ${minEnergyToWin}`);
      }
      continue;
    }

    // else get possible moves for every player, discarding any that takes us over > minEnergyToWin, and add to "nextMoves"
    const possibleNextMoves = getPossibleMovesForEveryPlayer(newPlayers);
    possibleNextMoves
      .filter((m) => accEnergy + m.energy < minEnergyToWin)
      .forEach((m) =>
        addMoveToSortedIndex(nextMoves, [
          m,
          accEnergy + m.energy,
          newPlayers,
          wins + (m.isWin ? 1 : 0),
        ])
      );
  }

  return minEnergyToWin;
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  // parse lines
  const roomDoor = [...lines[2].match(/[A-D]/gi)];
  const roomBack = [...lines[3].match(/[A-D]/gi)];

  return [roomDoor, roomBack];
};

// run
main(process.argv[2] || INPUT_FILE);
