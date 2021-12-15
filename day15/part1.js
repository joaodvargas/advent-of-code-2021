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

  while (true) {
    const currentNode = nodes[shortestRiskNodeIndex(riskCount, visited)];
    if (currentNode.index === endNode.index) {
      // end
      break;
    }
    for (edge of currentNode.edges) {
      if (!visited[edge.index]) {
        riskCount[edge.index] = Math.min(
          riskCount[edge.index],
          riskCount[currentNode.index] + edge.risk
        );
      }
    }
    visited[currentNode.index] = true;
  }

  return riskCount[endNode.index];
};

const shortestRiskNodeIndex = (riskCount, visited) => {
  let shortest = null;

  for (let nodeIndex = 0; nodeIndex < riskCount.length; nodeIndex++) {
    const currentIsShortest =
      shortest === null || riskCount[nodeIndex] < riskCount[shortest];
    if (currentIsShortest && !visited[nodeIndex]) {
      shortest = nodeIndex;
    }
  }
  return shortest;
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  let index = 0;
  const matrixRisk = lines.map((line, y) =>
    [...line].map((n, x) => ({
      index: index++,
      y,
      x,
      risk: +n,
      edges: [],
    }))
  );

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

  // ensure all edges are ordered from lowest to highest risk
  nodes.forEach((n) => (n.edges = n.edges.sort((nA, nB) => nA.risk - nB.risk)));

  return nodes;
};

// run
main(process.argv[2] || INPUT_FILE);
