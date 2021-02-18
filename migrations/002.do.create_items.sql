CREATE TABLE items (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  available TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL
);