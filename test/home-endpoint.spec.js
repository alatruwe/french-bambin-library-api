const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Home Endpoint", function () {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testItems = helpers.makeItemsArray();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () =>
    db.raw("TRUNCATE requests, items, users RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () =>
    db.raw("TRUNCATE requests, items, users RESTART IDENTITY CASCADE")
  );

  describe(`GET /api/home`, () => {
    //test when database is empty
    context(`Given no items`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/home")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    // test when database has items
    context("Given there are items in the database", () => {
      beforeEach("insert items", () => {
        return db
          .into("users")
          .insert(testUsers)
          .then(() => {
            return db.into("items").insert(testItems);
          });
      });

      it("responds with 200 and all of the available items", () => {
        return supertest(app)
          .get("/api/home")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, testItems);
      });
    });
  });
});
