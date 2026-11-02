require("dotenv").config();
const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      user: "postgres",
      host: "localhost",
      database: "taskdb",
      password: process.env.DB_PASSWORD,
      port: 5432,
    });

module.exports = pool;