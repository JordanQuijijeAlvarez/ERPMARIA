const bcrypt = require('bcrypt');

async function run() {
  const hash = await bcrypt.hash("admin", 10);
  console.log(hash);
}

run();

