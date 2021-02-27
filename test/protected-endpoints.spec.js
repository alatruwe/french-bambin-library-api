const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Protected endpoints", function () {
  let db;

  const { testUsers, testItems } = helpers.makeLibraryFixtures();

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

  beforeEach("insert items", () => {
    return db
      .into("users")
      .insert(testUsers)
      .then(() => {
        return db.into("items").insert(testItems);
      });
  });

  const protectedEndpoints = [
    {
      name: "GET /api/home",
      path: "/api/home",
      method: supertest(app).get,
    },
    {
      name: "POST /api/send-request",
      path: "/api/send-request",
      method: supertest(app).post,
    },
    {
      name: "GET /api/item-history",
      path: "/api/item-history",
      method: supertest(app).get,
    },
    {
      name: "DELETE /api/item-history",
      path: "/api/item-history",
      method: supertest(app).delete,
    },
    {
      name: "POST /api/add-item",
      path: "/api/add-item",
      method: supertest(app).post,
    },
  ];

  protectedEndpoints.forEach((endpoint) => {
    describe(endpoint.name, () => {
      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = "bad-secret";
        return endpoint
          .method(endpoint.path)
          .set(
            "Authorization",
            helpers.makeAuthHeader(validUser, invalidSecret)
          )
          .expect(401, { error: `Unauthorized request` });
      });

      // test when the sub in the JWT payload is for a email that doesn't exist.
      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { email: "email-not-existy", id: 1 };
        return endpoint
          .method(endpoint.path)
          .set("Authorization", helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` });
      });
    });
  });
});
