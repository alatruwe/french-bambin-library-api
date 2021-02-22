const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: "ted",
      last_name: "ted",
      email: "ted@email.com",
      user_password: "ted-password",
    },
    {
      id: 2,
      first_name: "bill",
      last_name: "bill",
      email: "bill@email.com",
      user_password: "bill-password",
    },
    {
      id: 3,
      first_name: "mark",
      last_name: "mark",
      email: "mark@email.com",
      user_password: "mark-password",
    },
    {
      id: 4,
      first_name: "luke",
      last_name: "luke",
      email: "luke@email.com",
      user_password: "luke-password",
    },
    {
      id: 5,
      first_name: "john",
      last_name: "john",
      email: "john@email.com",
      user_password: "john-password",
    },
  ];
}

function makeItemsArray() {
  return [
    {
      id: 1,
      title: "Sami et Julie à la plage",
      description: "First item content!",
      image:
        "How-tohttps://images-na.ssl-images-amazon.com/images/I/51Griyx+2dL._SX437_BO1,204,203,200_.jpg",
      available: true,
      user_id: 1,
    },
    {
      id: 2,
      title: "Sami et Julie à la cantine",
      description: "Second item content!",
      image:
        "How-tohttps://images-na.ssl-images-amazon.com/images/I/51Griyx+2dL._SX437_BO1,204,203,200_.jpg",
      available: false,
      user_id: 2,
    },
    {
      id: 3,
      title: "Sami et Julie à la maison",
      description: "Third item content!",
      image:
        "How-tohttps://images-na.ssl-images-amazon.com/images/I/51Griyx+2dL._SX437_BO1,204,203,200_.jpg",
      available: true,
      user_id: 1,
    },
    {
      id: 4,
      title: "Sami et Julie à la l'ecole",
      description: "Fourth item content!",
      image:
        "How-tohttps://images-na.ssl-images-amazon.com/images/I/51Griyx+2dL._SX437_BO1,204,203,200_.jpg",
      available: true,
      user_id: 5,
    },
  ];
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    user_password: bcrypt.hashSync(user.user_password, 1),
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function makeLibraryFixtures() {
  const testUsers = makeUsersArray();
  const testItems = makeItemsArray();
  return { testUsers, testItems };
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeItemsArray,
  makeLibraryFixtures,
  makeAuthHeader,
  seedUsers,
};
