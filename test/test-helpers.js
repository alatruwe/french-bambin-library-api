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
      available: true,
      user_id: 1,
    },
    {
      id: 2,
      title: "Sami et Julie à la cantine",
      description: "Second item content!",
      available: false,
      user_id: 1,
    },
    {
      id: 3,
      title: "Sami et Julie à la maison",
      description: "Third item content!",
      available: true,
      user_id: 2,
    },
    {
      id: 4,
      title: "Sami et Julie à la l'ecole",
      description: "Fourth item content!",
      available: true,
      user_id: 2,
    },
  ];
}

function makeRequestsArray() {
  return [
    {
      id: 1,
      subject: "Hi",
      message: "First email content!",
      date_sent: new Date("2029-01-22T16:28:32.615Z"),
      sender_id: 1,
      item_id: 2,
    },
    {
      id: 2,
      subject: "Hi",
      message: "First email content!",
      date_sent: new Date("2029-01-22T16:28:32.615Z"),
      sender_id: 2,
      item_id: 1,
    },
    {
      id: 3,
      subject: "Hi",
      message: "First email content!",
      date_sent: new Date("2029-01-22T16:28:32.615Z"),
      sender_id: 1,
      item_id: 2,
    },
    {
      id: 4,
      subject: "Hi",
      message: "First email content!",
      date_sent: new Date("2029-01-22T16:28:32.615Z"),
      sender_id: 1,
      item_id: 2,
    },
    {
      id: 5,
      subject: "Hi",
      message: "First email content!",
      date_sent: new Date("2029-01-22T16:28:32.615Z"),
      sender_id: 1,
      item_id: 2,
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

function seedItemsTables(db, users, items, requests = []) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("items").insert(items);
    // update the auto sequence to match the forced id values
    await trx.raw(`SELECT setval('items_id_seq', ?)`, [
      items[items.length - 1].id,
    ]);
    // only insert comments if there are some, also update the sequence counter
    if (requests.length) {
      await trx.into("requests").insert(requests);
      await trx.raw(`SELECT setval('requests_id_seq', ?)`, [
        requests[requests.length - 1].id,
      ]);
    }
  });
}

function seedRequests(db, requests) {
  return db.insert(requests).into("requests").returning("*");
}

function makeLibraryFixtures() {
  const testUsers = makeUsersArray();
  const testItems = makeItemsArray();
  return { testUsers, testItems };
}

function makeExpectedItems(user, items) {
  const expectedItems = items.filter((item) => {
    return item.user_id === user.id;
  });
  return expectedItems.map((item) => {
    return {
      title: item.title,
      description: item.description,
      id: item.id,
    };
  });
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
  makeRequestsArray,
  makeLibraryFixtures,
  makeExpectedItems,
  makeAuthHeader,
  seedUsers,
  seedItemsTables,
  seedRequests,
};
