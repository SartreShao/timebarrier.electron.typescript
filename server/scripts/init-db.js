const { runSchema, config } = require("../db");

runSchema()
  .then(() => {
    console.log(`Initialized MySQL schema "${config.database}" at ${config.host}:${config.port}`);
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
