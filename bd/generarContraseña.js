const bcrypt = require('bcrypt');

async function run() {
  const hash = await bcrypt.hash("golem1", 10);
  console.log(hash);
}

run();

