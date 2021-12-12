//const INPUT_FILE = 'example3.in';
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

const STARTING_VERTEX = 'start';
const END_VERTEX = 'end';
const isSmallCave = (name) => name.toLowerCase() === name;

const possiblePaths = [];

// main code
function main(lines) {
  const caves = parseInputToGraph(lines);
  caves.explore = exploreVertexFunc(caves);

  caves.explore(STARTING_VERTEX, [STARTING_VERTEX], []);

  return possiblePaths.length;
}

// Recursive visit graph
const exploreVertexFunc = (caves) => (vertexName, currentPath, visited) => {
  const { edges } = caves[vertexName];
  const newVisitedMap = isSmallCave(vertexName)
    ? { ...visited, [vertexName]: true }
    : visited;

  for (let edge of edges) {
    if (edge === END_VERTEX) {
      // reached end
      possiblePaths.push([...currentPath, edge]);
    } else if (!isSmallCave(edge) || !visited[edge]) {
      caves.explore(edge, [...currentPath, edge], { ...newVisitedMap });
    }
    // if edge already explored, do nothing
  }
};

// Input parser / graph builder
const parseInputToGraph = (lines) =>
  lines.reduce((graph, connection) => {
    const [pointA, pointB] = connection.split('-');
    addToGraphVertexAndEdge(graph, pointA, pointB); // pointA -> pointB
    addToGraphVertexAndEdge(graph, pointB, pointA); // pointB -> pointA
    return graph;
  }, {});

const addToGraphVertexAndEdge = (graph, pointName, connectedTo) => {
  if (graph[pointName] == null) {
    graph[pointName] = {
      edges: new Set(),
    };
  }
  graph[pointName].edges.add(connectedTo);
};
