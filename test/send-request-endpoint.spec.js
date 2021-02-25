const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe.only("Send Request Endpoints", function () {
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

  describe(`POST /api/send-request`, () => {
    beforeEach("insert items", () =>
      helpers.seedItemsTables(db, testUsers, testItems)
    );

    it(`creates an request, responding with 201 and the new request`, function () {
      this.retries(3);
      const testItem = testItems[0];
      const testUser = testUsers[0];
      const newRequest = {
        subject: "Test new request",
        message: "test message",
        sender_id: testUser.id,
        item_id: testItem.id,
      };
      return supertest(app)
        .post("/api/send-request")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newRequest)
        .expect(201)
        .expect((res) =>
          db
            .from("requests")
            .select("*")
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(row.subject).to.eql(newRequest.subject);
              expect(row.message).to.eql(newRequest.message);
              expect(row.sender_id).to.eql(newRequest.sender_id);
              expect(row.item_id).to.eql(newRequest.item_id);
              const expectedDate = new Date().toLocaleString("en", {
                timeZone: "UTC",
              });
              const actualDate = new Date(row.date_sent).toLocaleString();
              expect(actualDate).to.eql(expectedDate);
            })
        );
    });

    it(`send an email, responding with 201`, function () {
      const testItem = testItems[0];
      const testUser = testUsers[0];
      const newRequest = {
        subject: "Test new request",
        message: "test message",
        sender_id: testUser.id,
        item_id: testItem.id,
      };
      return supertest(app)
        .post("/api/send-request")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newRequest)
        .expect(201);
    });
  });
});
