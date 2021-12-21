//const INPUT_FILE = 'example-short.in';
const INPUT_FILE = 'example.in';
//const INPUT_FILE = 'input.in';

const LOG = true;
const log = LOG && console.log;

const readLines = require('../utils/readLines');

// main code
function main(filePath) {
  parseInput(filePath).then((input) => {
    const solution = solve(input);
    console.log(`The value you are looking for is ${solution}`);
  });
}

// operate on input to solve problem
const solve = (scanners) => {
  // calculate local probe distance
  scanners.forEach(calculateProbeManhattanDistance);

  // see which scanners have overlapping probes and use it to calculate relative distance between scanners
  findOverlapsAndRelativeDistances(scanners);

  // build array of scanners distances relative to s0, our origin
  const scannerDistances = buildScannersDistanceToOriginMap(scanners);

  for (let idx = 0; idx < scannerDistances.length; idx++) {
    const sDist = scannerDistances[idx];
    log(
      `Scanner ${idx} is at (${sDist.x},${sDist.y},${
        sDist.z
      }) applying calibrations: ${sDist.calibrations
        .map((c) => calibrationToStr(c))
        .join(' * ')}`
    );
  }

  return 42;
};

const calibrationToStr = (calibration) => {
  const mapIndexToLetter = {
    [0]: 'x',
    [1]: 'y',
    [2]: 'z',
  };

  let str = '[';

  // x
  str += calibration.x[1] < 0 ? '-' : '';
  str += mapIndexToLetter[calibration.x[0]];
  str += ', ';
  // y
  str += calibration.y[1] < 0 ? '-' : '';
  str += mapIndexToLetter[calibration.y[0]];
  str += ', ';
  // z
  str += calibration.z[1] < 0 ? '-' : '';
  str += mapIndexToLetter[calibration.z[0]];
  str += ']';
  return str;
};

const buildScannersDistanceToOriginMap = (scanners) => {
  const originScanner = scanners[0];
  let distancesMissing = scanners.length - 1;
  const scannerDistances = Array(scanners.length);
  scannerDistances[0] = {
    x: 0,
    y: 0,
    z: 0,
    calibrations: [],
  };

  const calculateDistanceBetweenScanners = (s1, s2) => {
    if (scannerDistances[s2.id] != null || distancesMissing === 0) {
      // found it already
      return;
    }

    // get previous distance calculated
    const s1toOrigin = scannerDistances[s1.id];

    const calibratedS1toS2Distance = applyCalibrationToCoordinates(
      s1.distanceTo[s2.id],
      s1toOrigin.calibrations
    );
    const s2toOrigin = addUpCoordinates(s1toOrigin, calibratedS1toS2Distance);
    scannerDistances[s2.id] = {
      ...s2toOrigin,
      calibrations: [s1.relativeCalibration[s2.id], ...s1toOrigin.calibrations],
    };
    distancesMissing--;

    for (let idx = 0; idx < s2.distanceTo.length; idx++) {
      if (s2.distanceTo[idx] == null) {
        continue;
      }
      calculateDistanceBetweenScanners(s2, scanners[idx]);
    }
  };

  for (let idx = 0; idx < originScanner.distanceTo.length; idx++) {
    if (originScanner.distanceTo[idx] == null) {
      continue;
    }
    calculateDistanceBetweenScanners(originScanner, scanners[idx]);
  }

  return scannerDistances;
};

const findOverlapsAndRelativeDistances = (scanners) => {
  // look for overlaps
  for (let s1Index = 0; s1Index < scanners.length; s1Index++) {
    for (let s2Index = s1Index + 1; s2Index < scanners.length; s2Index++) {
      const scanner1 = scanners[s1Index],
        scanner2 = scanners[s2Index];

      // compare probe by probe
      const matchingProbes = findProbesWithSameDistanceToOtherProbes(
        scanner1,
        scanner2
      );

      if (matchingProbes.length >= 12) {
        log(
          `Found ${matchingProbes.length} probes shared between scanners ${s1Index} and ${s2Index}`
        );
        let resolvedLocation = false;
        // use to resolve location relative to origin - scanner 1 location
        for (
          let matchIndex = 0;
          matchIndex < matchingProbes.length;
          matchIndex++
        ) {
          if (resolvedLocation) {
            break;
          }
          const [p1Index, p2Index] = matchingProbes[matchIndex];
          const probe1 = scanner1.probes[p1Index];
          const probe2 = scanner2.probes[p2Index];
          // look for x,y,z adjustments
          for (let p1Distance of probe1.distances.filter((d) => d != null)) {
            // matching p2 distance
            const p2Distance = probe2.distances
              .filter((d) => d != null)
              .find((d) => d.total === p1Distance.total);
            if (p2Distance == null) {
              continue;
            }

            const calibration = calibrateAxisBasedOnDistance(
              p1Distance,
              p2Distance
            );
            if (calibration != null) {
              // we can calculate distance from probe to source
              const p2CalibratedDistance = applyCalibrationToCoordinates(
                probe2,
                calibration
              );

              const distanceToScanner1 = getDistanceBetweenCoordinates(
                probe1,
                p2CalibratedDistance
              );

              // found position of scanner2 relative to scanner1!
              scanner1.distanceTo[scanner2.id] = distanceToScanner1;
              scanner1.relativeCalibration[scanner2.id] = calibration;

              // execute same logic in regards to s2 -> s1
              const reverseCalibration = calibrateAxisBasedOnDistance(
                p2Distance,
                p1Distance
              );
              if (reverseCalibration == null) {
                throw Error('Unexpected null calibration found.');
              }
              const p1CalibratedDistance = applyCalibrationToCoordinates(
                probe1,
                reverseCalibration
              );
              const distanceToScanner2 = getDistanceBetweenCoordinates(
                probe2,
                p1CalibratedDistance
              );
              scanner2.distanceTo[scanner1.id] = distanceToScanner2;
              scanner2.relativeCalibration[scanner1.id] = reverseCalibration;

              resolvedLocation = true;
              break;
            }
          }
        }
      }
    }
  }
};

const calibrateAxisBasedOnDistance = (distance1, distance2) => {
  // if we have same distances, go to next
  const distanceSet = new Set([
    Math.abs(distance1.x),
    Math.abs(distance2.x),
    Math.abs(distance1.y),
    Math.abs(distance2.y),
    Math.abs(distance1.z),
    Math.abs(distance2.z),
  ]);
  if (distanceSet.size < 3) {
    return null;
  }

  for (let idx = 0; idx < possibleCalibrations.length; idx++) {
    const calibration = possibleCalibrations[idx];
    const calibratedDistance = applyCalibrationToCoordinates(
      distance2,
      calibration
    );
    if (
      distance1.x === calibratedDistance.x &&
      distance1.y === calibratedDistance.y &&
      distance1.z === calibratedDistance.z
    ) {
      return calibration;
    }
  }
  throw Error('Unable to find meaningful calibration');
};

const applyCalibrationToCoordinates = (coordinates, calibrations) => {
  if (!Array.isArray(calibrations)) {
    calibrations = [calibrations];
  }

  const newCoordinates = [coordinates.x, coordinates.y, coordinates.z];
  for (let cIndex = 0; cIndex < calibrations.length; cIndex++) {
    const calibration = calibrations[cIndex];
    const workingCoordinates = [...newCoordinates];
    newCoordinates[calibration.x[0]] = workingCoordinates[0] * calibration.x[1];
    newCoordinates[calibration.y[0]] = workingCoordinates[1] * calibration.y[1];
    newCoordinates[calibration.z[0]] = workingCoordinates[2] * calibration.z[1];
  }

  return {
    x: newCoordinates[0],
    y: newCoordinates[1],
    z: newCoordinates[2],
  };
};

const getDistanceBetweenCoordinates = (c1, c2) => ({
  x: c1.x - c2.x,
  y: c1.y - c2.y,
  z: c1.z - c2.z,
});

const addUpCoordinates = (c1, c2) => ({
  x: c1.x + c2.x,
  y: c1.y + c2.y,
  z: c1.z + c2.z,
});

// Possible axis orientations, with [<place in x,y,z>, <forward or backward>]
const possibleCalibrations = [
  { x: [0, 1], y: [1, 1], z: [2, 1] }, // x, y, z
  { x: [0, 1], y: [2, 1], z: [1, -1] }, // x, z, -y
  { x: [0, 1], y: [1, -1], z: [2, -1] }, // x, -y, -z
  { x: [0, 1], y: [2, -1], z: [1, 1] }, // x, -z, y

  { x: [0, -1], y: [1, 1], z: [2, -1] }, // -x, y, -z
  { x: [0, -1], y: [2, -1], z: [1, -1] }, // -x, -z, -y
  { x: [0, -1], y: [1, -1], z: [2, 1] }, // -x, -y, z
  { x: [0, -1], y: [2, 1], z: [1, 1] }, // -x, z, y

  { x: [1, 1], y: [0, -1], z: [2, 1] }, // y, -x, z
  { x: [2, -1], y: [0, -1], z: [1, 1] }, // -z, -x, y
  { x: [1, -1], y: [0, -1], z: [2, -1] }, // -y, -x, -z
  { x: [2, 1], y: [0, -1], z: [1, -1] }, // z, -x, -y

  { x: [1, -1], y: [0, 1], z: [2, 1] }, // -y, x, z
  { x: [2, -1], y: [0, 1], z: [1, -1] }, // -z, x, -y
  { x: [1, 1], y: [0, 1], z: [2, -1] }, // y, x, -z
  { x: [2, 1], y: [0, 1], z: [1, 1] }, // z, x, y

  { x: [2, -1], y: [1, 1], z: [0, 1] }, // -z, y, x
  { x: [1, 1], y: [2, 1], z: [0, 1] }, // y, z, x
  { x: [2, 1], y: [1, -1], z: [0, 1] }, // z, -y, x
  { x: [1, -1], y: [2, -1], z: [0, 1] }, // -y, -z, x

  { x: [2, 1], y: [1, 1], z: [0, -1] }, // z, y, -x
  { x: [1, 1], y: [2, -1], z: [0, -1] }, // y, -z, -x
  { x: [2, -1], y: [1, -1], z: [0, -1] }, // -z, -y, -x
  { x: [1, -1], y: [2, 1], z: [0, -1] }, // -y, z, -x
];

const findProbesWithSameDistanceToOtherProbes = (scanner1, scanner2) => {
  // compare probe by probe
  const possibleMatch = [];
  for (
    let s1probeIndex = 0;
    s1probeIndex < scanner1.probes.length;
    s1probeIndex++
  ) {
    // can't find 12 overlapping probes, abort early
    if (possibleMatch.length + (scanner1.probes.length - s1probeIndex) < 12) {
      break;
    }

    for (
      let s2probeIndex = 0;
      s2probeIndex < scanner2.probes.length;
      s2probeIndex++
    ) {
      const scanner1Probe = scanner1.probes[s1probeIndex];
      const scanner2Probe = scanner2.probes[s2probeIndex];

      const possibleOverlaps = scanner1Probe.totalDistances.filter((d) =>
        scanner2Probe.totalDistances.includes(d)
      );
      if (possibleOverlaps.length >= 11) {
        // found matching probe
        scanner2Probe.isDuplicate = true;
        possibleMatch.push([s1probeIndex, s2probeIndex]);
        break;
      }
    }
  }

  return possibleMatch;
};

const calculateProbeManhattanDistance = ({ id, probes }) => {
  for (let p1Index = 0; p1Index < probes.length; p1Index++) {
    for (let p2Index = p1Index + 1; p2Index < probes.length; p2Index++) {
      // dist between every probe
      const p1 = probes[p1Index],
        p2 = probes[p2Index];
      const x = p2.x - p1.x,
        y = p2.y - p1.y,
        z = p2.z - p1.z;

      p1.distances = p1.distances || [];
      p1.distances[p2.id] = {
        toProbe: p2.id,
        x,
        y,
        z,
        total: Math.abs(x) + Math.abs(y) + Math.abs(z),
      };
      p2.distances = p2.distances || [];
      p2.distances[p1.id] = {
        toProbe: p1.id,
        x: -x,
        y: -y,
        z: -z,
        total: Math.abs(x) + Math.abs(y) + Math.abs(z),
      };
    }
    probes[p1Index].totalDistances = probes[p1Index].distances
      .map((d) => d.total)
      .sort((a, b) => a - b);
  }
};

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  const scanners = [];

  let scannerIndex = 0;
  let probeIndex = 0;
  for (line of lines) {
    if (line.indexOf('---') > -1) {
      // new probe
      scanners.push({
        id: scannerIndex++,
        probes: [],
        distanceTo: [],
        relativeCalibration: [],
      });
      probeIndex = 0;
    } else {
      const [x, y, z] = line.split(',').map((n) => +n);
      scanners[scannerIndex - 1].probes.push({
        id: probeIndex++,
        x,
        y,
        z,
      });
    }
  }

  return scanners;
};

// run
main(process.argv[2] || INPUT_FILE);
