const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Auth Endpoints", function () {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

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

  describe(`POST /api/login`, () => {
    beforeEach("insert users", () => {
      helpers.seedUsers(db, testUsers);
    });

    const requiredFields = ["email", "user_password"];

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        email: testUser.email,
        user_password: testUser.user_password,
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post("/api/login")
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it(`responds 400 'invalid email or password' when bad email`, () => {
      const userInvalidUser = { email: "email-not", user_password: "existy" };
      return supertest(app)
        .post("/api/login")
        .send(userInvalidUser)
        .expect(400, { error: `Incorrect email or password` });
    });

    it(`responds 400 'invalid email or password' when bad password`, () => {
      const userInvalidPass = {
        email: testUser.email,
        user_password: "incorrect",
      };
      return supertest(app)
        .post("/api/login")
        .send(userInvalidPass)
        .expect(400, { error: `Incorrect email or password` });
    });

    it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
      const userValidCreds = {
        email: testUser.email,
        user_password: testUser.user_password,
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.email,
          algorithm: "HS256",
        }
      );
      return supertest(app)
        .post("/api/login")
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });
});
