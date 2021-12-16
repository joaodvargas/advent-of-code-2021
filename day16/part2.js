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

// operate on input to solve problem
const solve = (transmission) => {
  return transmission.literal;
};

const reduceToVersionSum = (packet) =>
  !packet.innerPackets
    ? packet.version
    : packet.version +
      packet.innerPackets.reduce((acc, p) => acc + reduceToVersionSum(p), 0);

// hexadecimal char to binary
const hexaToBinary = (hexaChar) => {
  const binary = '000' + parseInt(hexaChar, 16).toString(2);
  return binary.substring(binary.length - 4);
};

const binaryToNumber = (binary) => parseInt(binary, 2);

const END_OF_PACKET = '0';
const LITERAL_TYPE_ID = 4;

// read file input into data structure(s)
const parseInput = async (filePath) => {
  const lines = await readLines(filePath);
  if (!lines || !lines.length) {
    throw Error('No data found... :(');
  }

  // parse lines
  const binaryTransmission = [...lines[0]].reduce((acc, char) => {
    return acc + hexaToBinary(char);
  }, '');

  const transmission = decodeTransmission(binaryTransmission);
  return transmission;
};

const decodeTransmission = (binaryTransmission) => {
  const version = binaryToNumber(binaryTransmission.substring(0, 3));
  const typeId = binaryToNumber(binaryTransmission.substring(3, 6));
  if (typeId === LITERAL_TYPE_ID) {
    // literal packet
    const [literal, readBits] = parseLiteralPacket(
      binaryTransmission.substring(6)
    );
    return {
      version,
      typeId,
      literal,
      bitSize: 6 + readBits,
    };
  } else {
    // operator packet
    const isLengthTypeIdOfTotalBitsLength = binaryTransmission[6] === '0';
    let startingIndex = 0;
    const innerPackets = [];
    if (isLengthTypeIdOfTotalBitsLength) {
      const length = binaryToNumber(binaryTransmission.substring(7, 22));
      // iterate on every packet within, up to the length limit
      startingIndex = 22;
      let runningLength = length;
      while (runningLength > 0) {
        const packet = decodeTransmission(
          binaryTransmission.substring(startingIndex)
        );
        innerPackets.push(packet);
        startingIndex += packet.bitSize;
        runningLength -= packet.bitSize;
      }
    } else {
      let numberOfPackets = binaryToNumber(binaryTransmission.substring(7, 18));
      // iterate on every packet within, up to the length limit
      startingIndex = 18;
      while (numberOfPackets-- > 0) {
        const packet = decodeTransmission(
          binaryTransmission.substring(startingIndex)
        );
        innerPackets.push(packet);
        startingIndex += packet.bitSize;
      }
    }

    const literal = applyOperationToPackets(typeId, innerPackets);

    return {
      version,
      typeId,
      innerPackets,
      bitSize: startingIndex,
      literal,
    };
  }
};

const applyOperationToPackets = (typeId, packets) => {
  switch (typeId) {
    case 0:
      return packets.reduce((acc, p) => acc + p.literal, 0);
    case 1:
      return packets.reduce((acc, p) => acc * p.literal, 1);
    case 2:
      return Math.min.apply(
        null,
        packets.map((p) => p.literal)
      );
    case 3:
      return Math.max.apply(
        null,
        packets.map((p) => p.literal)
      );
    case 5:
      guardIsPairOfPackets(packets);
      return packets[0].literal > packets[1].literal ? 1 : 0;

    case 6:
      guardIsPairOfPackets(packets);
      return packets[0].literal < packets[1].literal ? 1 : 0;

    case 7:
      guardIsPairOfPackets(packets);
      return packets[0].literal == packets[1].literal ? 1 : 0;
    default:
      throw Error(`Unknown operation: ${typeId}`);
  }
};

const guardIsPairOfPackets = (packets) => {
  if (packets.length !== 2) {
    throw Error(`Expected to have 2 packets but found ${packets.length}`);
  }
  return true;
};

const LITERAL_GROUP_SIZE = 5;
const parseLiteralPacket = (literalTransmission) => {
  let binaryValue = '';
  let readBits = 0;
  for (
    let index = 0;
    index < literalTransmission.length;
    index += LITERAL_GROUP_SIZE
  ) {
    // prefix bit to signal group end + 4 bits = 5
    const binaryPart = literalTransmission.substring(
      index + 1,
      index + LITERAL_GROUP_SIZE
    );
    binaryValue += binaryPart;
    // end
    if (literalTransmission[index] === END_OF_PACKET) {
      readBits = index + LITERAL_GROUP_SIZE;
      break;
    }
  }
  return [parseInt(binaryValue, 2), readBits];
};

// run
main(process.argv[2] || INPUT_FILE);
