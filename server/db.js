const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const config = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "timebarrier",
  database: process.env.DB_NAME || "timebarrier_ts",
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  multipleStatements: true
};

const pool = mysql.createPool(config);

async function query(sql, params = {}) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function runSchema() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const connection = await mysql.createConnection({
    ...config,
    database: undefined
  });
  try {
    await connection.query(schema);
  } finally {
    await connection.end();
  }
}

module.exports = {
  config,
  pool,
  query,
  transaction,
  runSchema
};
