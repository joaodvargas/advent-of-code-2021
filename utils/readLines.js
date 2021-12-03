const fs = require('fs');
const readline = require('readline');

module.exports = async function (file) {
  const linesRead = [];
  const fileStream = fs.createReadStream(file);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    if (line && line.trim()) {
      linesRead.push(line);
    }
  }
  return linesRead;
};
