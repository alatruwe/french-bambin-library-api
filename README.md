# French Bambin Library API

The french bambin library is a french books platform exchange. 

It helps connect parents to find and share french learning materials.

## Install:

    npm install

## Run the app:

    npm start

## Run the tests:

    npm test

# API

This API uses GET, POST and DELETE requests to manage the French Bambin Library app content.

All responses come in standard JSON.
All requests must include a content-type of application/json and the body must be valid JSON.

## Notes:

The API features below aren't fully implemented, but the database is already supporting them:

- Uploading images.
- Availability of a book.

## Failed Resquests and response:

For all endpoints, upon receiving an unauthorized or bad request you get:

**Failed Response:**

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
    "error": "Unauthorized request"
}
```

or

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
    "error": "error message here"
}
```

## Endpoints:

## Login

**You send:** Your login credentials.

**You get:** An `authToken` with wich you can make further actions.

- authToken => string

**Request:**

```json
POST /api/login HTTP/1.1
Content-Type: application/json

{
    "email": "my@email.com",
    "user_password": "myPassword"
  }
```

**Successful Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
   "authToken": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

## SignUp

**You send:** Your information.

**You get:** An `authToken` with which you can make further actions. A user profile is created:

- id => number
- first_name => string
- last_name => string
- email => string
- authToken => string

**Request:**

```json
POST /api/signup HTTP/1.1
Content-Type: application/json

{
    "first_name": "first name",
    "last_name": "last name",
    "email": "tmy@email.com",
    "user_password": "myPassword"
  }
```

**Successful Response:**

```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 3,
  "first_name": "first name",
  "last_name": "last name",
  "email": "tmy@email.com",
  "authToken": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

## Homepage

**You send:** Your authToken.

**You get:** A list of all books and for each book:

- id => number
- title => string
- description => string
- available => true
- user_id => number

**Request:**

```json
GET /api/home HTTP/1.1
Authorization: bearer "your authToken"
Content-Type: application/json
```

**Successful Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
      "id": 1,
      "title": "first book",
      "description": "book information here",
      "available": true,
      "user_id": 1
  },
  {
      "id": 2,
      "title": "second book",
      "description": "book information here",
      "available": true,
      "user_id": 1
  },
  {
      "id": 3,
      "title": "third book",
      "description": "book information here",
      "available": true,
      "user_id": 1
  }
]
```

## Add a new book

**You send:** Your authToken. The book information.

**You get:** The book profile created with:

- id => number
- title => string
- description => string
- image => null
- available => true
- user_id => number

**Request:**

```json
POST /api/add-item HTTP/1.1
Authorization: bearer "your authToken"
Content-Type: application/json

{
    "title": "book title",
    "description": "book information here"
  }
```

**Successful Response:**

```json
HTTP/1.1 201 Created
Content-Type: application/json

  {
    "id": 1,
    "title": "book title",
    "description": "book information here",
    "image": null,
    "available": true,
    "user_id": 1
  }

]
```

## Send a request

**You send:** Your authToken. The request information.

**You get:** The request profile created with:

- id => number
- subject => string
- message => string
- date_sent => string
- sender_id => number
- item_id => number

**Request:**

```json
POST /api/send-request HTTP/1.1
Authorization: bearer "your authToken"
Content-Type: application/json

{
    "subject": "request subject here",
    "message": "request message here",
    "item_id": "30 (for example)"
  }
```

**Successful Response:**

```json
HTTP/1.1 201 Created
Content-Type: application/json

  {
    "id": 5,
    "subject": "request subject here",
    "message": "request message here",
    "date_sent": "2021-03-03T18:13:23.919Z",
    "sender_id": 1,
    "item_id": 30
  }
```

## Book history

**You send:** Your authToken.

**You get:** A list of all books the user has added and for each book:

- id => number
- title => string
- description => string

**Request:**

```json
GET /api/item-history HTTP/1.1
Authorization: bearer "your authToken"
Content-Type: application/json

```

**Successful Response:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "title": "book title",
    "description": "book information here",
    "id": 20
  },
  {
    "title": "book title",
    "description": "book information here",
    "id": 22
  },
  {
    "title": "book title",
    "description": "book information here",
    "id": 23
  }
]
```

## Delete a book

**You send:** Your authToken.

**Request:**

```json
DELETE /api/item/:item_id HTTP/1.1
Authorization: bearer "your authToken"
Content-Type: application/json

```

**Successful Response:**

```json
HTTP/1.1 204 No Content
Content-Type: application/json

```
