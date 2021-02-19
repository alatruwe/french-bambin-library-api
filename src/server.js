require("dotenv").config();

const knex = require("knex");
const app = require("./app");
const { PORT, DB_URL } = require("./config");

const db = knex({
  client: "pg",
  connection: DB_URL,
});
console.log("knex and driver installed correctly");

db("users")
  .select("*")
  .then((results) => {
    console.log(results);
  });

app.set("db", db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
