const bcrypt = require('bcrypt');

async function run() {
  const hash = await bcrypt.hash("jaime123", 10);
  console.log(hash);
}

run();

