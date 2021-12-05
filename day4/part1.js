//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

// entry point
try {
  (async () => {
    const lines = await readLines(INPUT_FILE);
    if (lines) {
      const [v1, v2] = main(lines);
      console.log(`Calculated ${v1} and ${v2} for a total of ${v1 * v2}`);
    } else {
      console.log('No data found... :(');
    }
  })();
} catch (err) {
  console.log(err);
}

// main code
function main(lines) {
  // init data
  const [drawLine, ...bingoBoardLines] = lines;
  const numbersDrawn = getNumberDraws(drawLine);
  const bingoBoards = getBingoBoards(bingoBoardLines);

  if (bingoBoards.length !== bingoBoardLines.length / 5) {
    throw new Error('Boards and board lines do not match!');
  }

  // draw numbers and check each board
  while (numbersDrawn) {
    const draw = numbersDrawn.shift();

    for (board of bingoBoards) {
      if (board.markNumber(draw)) {
        return [board.getUnmarkedNumbersSum(), draw];
      }
    }
  }

  throw new Error('No winner found...');
}

const getNumberDraws = (line) => line.split(',').map((n) => +n);

const getBingoBoards = (lines) => {
  const bingoBoards = [];
  const lineToNumberArray = (line) => line.match(/[^ ]+/g).map((n) => +n);

  lines.reduce((prev, line, idx) => {
    // every 5 lines we have a full board
    if ((idx + 1) % 5 === 0) {
      bingoBoards.push(new BingoBoard([...prev, lineToNumberArray(line)]));
      return [];
    }
    // else keep line for upcoming board
    prev.push(lineToNumberArray(line));
    return prev;
  }, []);
  return bingoBoards;
};

// bingo board
class BingoBoard {
  constructor(boardLines) {
    this.board = boardLines.map((row) =>
      row.map((cell) => ({
        number: cell,
        marked: false,
      }))
    );
  }

  markNumber(number) {
    // check if number exists
    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 5; column++) {
        if (this.board[row][column].number === number) {
          this.board[row][column].marked = true;
          return this.checkIfBingo(row, column);
        }
      }
    }
  }

  checkIfBingo(row, column) {
    const isRowBingo = this.board[row].reduce(
      (prev, cell) => cell.marked && prev,
      true
    );
    const isColumnBingo = this.board
      .map((row) => row[column])
      .reduce((prev, cell) => cell.marked && prev, true);

    return isRowBingo || isColumnBingo;
  }

  getUnmarkedNumbersSum() {
    let sum = 0;
    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 5; column++) {
        if (!this.board[row][column].marked) {
          sum += this.board[row][column].number;
        }
      }
    }
    return sum;
  }
}
