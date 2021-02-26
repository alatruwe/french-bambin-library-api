const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe.only("Item History Endpoint", function () {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testItems = helpers.makeItemsArray();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
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

  describe(`GET /api/item-history`, () => {
    //test when database is empty
    context(`Given no items`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/item-history")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    // test when database has items
    context("Given there are items in the database", () => {
      beforeEach("insert items", () =>
        helpers.seedItemsTables(db, testUsers, testItems)
      );

      it("responds with 200 and the specified items", () => {
        const expectedItems = helpers.makeExpectedItems(
          testUsers[0],
          testItems
        );
        return supertest(app)
          .get(`/api/item-history/`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedItems);
      });
    });
  });
});
