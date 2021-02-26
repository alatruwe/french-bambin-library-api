const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

describe("Signup Endpoints", function () {
  let db;

  const { testUsers } = helpers.makeLibraryFixtures();
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

  describe(`POST /api/signup`, () => {
    context(`User Validation`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      const requiredFields = [
        "first_name",
        "last_name",
        "email",
        "user_password",
      ];

      requiredFields.forEach((field) => {
        const registerAttemptBody = {
          first_name: "test first_name",
          last_name: "test last_name",
          email: "test email",
          user_password: "test user_password",
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/signup")
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            });
        });
      });

      it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
        const userShortPassword = {
          first_name: "test first-name",
          last_name: "test last_name",
          email: "test email",
          user_password: "1234567",
        };
        return supertest(app)
          .post("/api/signup")
          .send(userShortPassword)
          .expect(400, { error: `Password must be longer than 8 characters` });
      });

      it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
        const userLongPassword = {
          first_name: "test first-name",
          last_name: "test last_name",
          email: "test email",
          user_password: "*".repeat(73),
        };
        return supertest(app)
          .post("/api/signup")
          .send(userLongPassword)
          .expect(400, { error: `Password must be less than 72 characters` });
      });

      it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          first_name: "test first-name",
          last_name: "test last_name",
          email: "test email",
          user_password: " 1Aa!2Bb@",
        };
        return supertest(app)
          .post("/api/signup")
          .send(userPasswordStartsSpaces)
          .expect(400, {
            error: `Password must not start or end with empty spaces`,
          });
      });

      it(`responds 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
          first_name: "test first-name",
          last_name: "test last_name",
          email: "test email",
          user_password: "1Aa!2Bb@ ",
        };
        return supertest(app)
          .post("/api/signup")
          .send(userPasswordEndsSpaces)
          .expect(400, {
            error: `Password must not start or end with empty spaces`,
          });
      });

      it(`responds 400 error when password isn't complex enough`, () => {
        const userPasswordNotComplex = {
          first_name: "test first-name",
          last_name: "test last_name",
          email: "test email",
          user_password: "11AAaabb",
        };
        return supertest(app)
          .post("/api/signup")
          .send(userPasswordNotComplex)
          .expect(400, {
            error: `Password must contain 1 upper case, lower case, number and special character`,
          });
      });

      it(`responds 400 'Email already taken' when email isn't unique`, () => {
        const duplicateUser = {
          first_name: "test first-name",
          last_name: "test last_name",
          email: testUser.email,
          user_password: "11AAaa!!",
        };
        return supertest(app)
          .post("/api/signup")
          .send(duplicateUser)
          .expect(400, { error: `Email already taken` });
      });
    });
  });

  context(`Happy path`, () => {
    it(`responds 201 and JWT auth token using secret when valid signup`, () => {
      const newUser = {
        first_name: "test first_name",
        last_name: "test last_name",
        email: "test email",
        user_password: "11AAaa!!",
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.email,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: "HS256",
        }
      );
      return supertest(app)
        .post("/api/signup")
        .send(newUser)
        .expect(201)
        .expect((res) =>
          db
            .from("users")
            .select("*")
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(row.first_name).to.eql(newUser.first_name);
              expect(row.last_name).to.eql(newUser.last_name);
              expect(row.email).to.eql(newUser.email);

              return bcrypt.compare(newUser.user_password, row.user_password);
            })
            .then((compareMatch) => {
              expect(compareMatch).to.be.true;
            })
        );
    });
  });
});
