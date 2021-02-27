require("dotenv").config();

module.exports = {
  // where to find the migration steps
  migrationsDirectory: "migrations",
  driver: "pg",
  // url of the database
  connectionString:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL,
};
