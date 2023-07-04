require("dotenv").config();
const { Pool } = require("pg");

// console.log(process.env.DB_URI);
const adminPool = new Pool({
  connectionString: process.env.DB_URI,
});
module.exports = adminPool;
