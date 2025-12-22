const bcrypt = require('bcrypt');

async function run() {
  const hash = await bcrypt.hash("fuego123", 10);
  console.log(hash);
}

run();

