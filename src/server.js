require("dotenv").config();

const knex = require("knex");
const app = require("./app");
const { PORT, DATABASE_URL } = require("./config");

const db = knex({
  client: "pg",
  connection: {
    connectionString:
      "dbname=dbdg3vi0eik7la host=ec2-34-230-167-186.compute-1.amazonaws.com port=5432 user=lgwuruogcfvjce password=02ca089f1963c09e6d9da16339a7f4d2c2c963dc5a45668a5edefa4694274d15 sslmode=require",
  },
});

app.set("db", db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
