require("dotenv").config();
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");
const { Sequelize } = require("sequelize");
const apiUrl = "https://udpgqhfwyzgjmbsqpryy.supabase.co";
const apiKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcGdxaGZ3eXpnam1ic3Fwcnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI5NDg0OTcsImV4cCI6MjAwODUyNDQ5N30.Qav7xJhR5Mi61dVc4jJtJUiPH0_Ctz9mKFCQB2yVVrg";
const supabase = createClient(apiUrl, apiKey);

// console.log(process.env.DB_URI);
const sequelize = new Sequelize(process.env.SUPABASE_URI);
const adminPool = new Pool({
  connectionString: process.env.SUPABASE_URI,
});
module.exports = { adminPool, supabase, sequelize };
