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

  describe.skip(`GET /api/item-history`, () => {
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

  describe(`DELETE /api/item-history/item/:item_id`, () => {
    context(`Given no item`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));
      it(`responds with 404`, () => {
        const item_id = 123456;
        return supertest(app)
          .delete(`/api/item-history/item/${item_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `Item doesn't exist` } });
      });
    });

    context("Given there are items in the database", () => {
      beforeEach("insert items", () =>
        helpers.seedItemsTables(db, testUsers, testItems)
      );

      it("responds with 204 and removes the item", () => {
        const idToRemove = 2;
        const filteredItems = testItems.filter((item) => {
          item.id !== idToRemove;
          return item.id === testUsers[0].id;
        });
        const expectedItems = filteredItems.map((item) => {
          return {
            title: item.title,
            description: item.description,
            image: item.image,
          };
        });
        return supertest(app)
          .delete(`/api/item-history/item/${idToRemove}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/item-history`)
              .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedItems)
          );
      });
    });
  });
});
