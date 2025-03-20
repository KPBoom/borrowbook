import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:31102532@localhost:5432/borrowbooks",
});

console.log("Start connection test");

connectionPool
    .connect()
    .then((client) => {
        console.log("Connected to PostgreSQL successfully!");
        client.release();
    })
    .catch((err) => {
        console.error("Error connecting to PostgreSQL:", err);
    });

export default connectionPool;
