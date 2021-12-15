//const INPUT_FILE = 'example.in';
const INPUT_FILE = 'input.in';

const readLines = require('../utils/readLines');

// main code
function main(filePath) {
  parseInput(filePath).then((input) => {
    const solution = solve(input);
    console.log(`The value you are looking for is ${solution}`);
  });
}

// operate on input to solve problem - using custom made Dijkstra algorithm
const solve = (nodes) => {
  const startNode = nodes[0];
  const endNode = nodes[nodes.length - 1];

  // distance from start to every other node
  const riskCount = Array(nodes.length).fill(Number.MAX_VALUE);
  riskCount[0] = 0;
  const visited = Array(nodes.length).fill(false);

  const orderedAndUnvisitedNodes = [startNode];

  while (true) {
    const currentNode = orderedAndUnvisitedNodes.shift();
    if (currentNode.index === endNode.index) {
      // end
      break;
    }
    for (edge of currentNode.edges) {
      if (!visited[edge.index]) {
        const riskCalculation = riskCount[currentNode.index] + edge.risk;
        if (riskCalculation < riskCount[edge.index]) {
          if (riskCount[edge.index] !== Number.MAX_VALUE) {
            // need to resort array
            const edgeIndex = orderedAndUnvisitedNodes.indexOf(edge);
            orderedAndUnvisitedNodes.splice(edgeIndex, 1);
          }
          // add to sorted array
          riskCount[edge.index] = riskCalculation;
          const insertIdx = sortedIndex(
            riskCount,
            orderedAndUnvisitedNodes,
            riskCalculation
          );
          orderedAndUnvisitedNodes.splice(insertIdx, 0, edge);
        }
      }
    }
    visited[currentNode.index] = true;
  }

  return riskCount[endNode.index];
};

function sortedIndex(src, array, value) {
  var low = 0,
    high = array.length;

  while (low < high) {
    var mid = (low + high) >>> 1;
    if (src[array[mid].index] < value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  let index = 0;
  const incRisk = (risk) => (risk === 9 ? 1 : risk + 1);

  const multipliedLines = [
    ...lines,
    ...lines,
    ...lines,
    ...lines,
    ...lines,
  ].reduce((acc, line, y) => {
    const riskArray = [...line].map((n, idx) =>
      y >= lines.length ? incRisk(acc[y - lines.length][idx]) : +n
    );
    return [...acc, riskArray];
  }, []);

  const matrixRisk = multipliedLines.map((line, y) => {
    const newLine = [...line, ...line, ...line, ...line, ...line];
    return newLine.reduce((acc, n, x) => {
      acc.push({
        index: index++,
        y,
        x,
        risk: x >= line.length ? incRisk(acc[x - line.length].risk) : n,
        edges: [],
      });
      return acc;
    }, []);
  });

  // get adjacent matrix positions
  const isValidCoordinate = ({ x, y }) =>
    x >= 0 && x < matrixRisk[0].length && y >= 0 && y < matrixRisk.length;
  const getAdjacentPositions = (x, y) =>
    [
      { x, y: y - 1 },
      { x, y: y + 1 },
      { x: x - 1, y },
      { x: x + 1, y },
    ].filter(isValidCoordinate);

  const nodes = matrixRisk.reduce((acc, nodesLine) => {
    nodesLine.forEach((node) => {
      getAdjacentPositions(node.x, node.y).forEach((pos) =>
        node.edges.push(matrixRisk[pos.y][pos.x])
      );
    });
    return [...acc, ...nodesLine];
  }, []);

  return nodes;
};

// run
main(process.argv[2] || INPUT_FILE);
