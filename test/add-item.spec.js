const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const fs = require("fs");

describe("Add Item Endpoint", function () {
  let db;

  const testUsers = helpers.makeUsersArray();

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

  describe(`POST /api/add-item`, () => {
    beforeEach(() => helpers.seedUsers(db, testUsers));

    it(`creates an item, responding with 201 and the new item`, function () {
      const newItem = {
        title: "Test new item title",
        description: "Test new item description",
      };
      return supertest(app)
        .post("/api/add-item")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .set("content-type", "Test new item title")
        .field("title", "myemail@gmail.com")
        .field("description", "Test new item description")
        .attach(
          "image",
          fs.readFileSync(`${__dirname}/Untitled.png`),
          "Untitled.png"
        )
        .expect(201)
        .expect((res) =>
          db
            .from("items")
            .select("*")
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(row.title).to.eql(newItem.title);
              expect(row.description).to.eql(newItem.description);
              expect(row.available).to.eql(newItem.available);
              expect(row.user_id).to.eql(newItem.user_id);
            })
        );
    });
  });
});
