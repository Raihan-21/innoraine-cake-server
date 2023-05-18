const { Pool } = require("pg");

const adminPool = new Pool({
  connectionString:
    "postgresql://postgres:Vh4zNM3jbRVKafx4YINE@containers-us-west-11.railway.app:6146/railway",
});
module.exports = adminPool;
