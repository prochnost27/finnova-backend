const { Pool } = require("pg")

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "finnova_db",
  password: "Prochnost27",
  port: 5432,
})

module.exports = pool