# SERVERLESS STACK PRACTICE

We need to create a serverless environment capable of managing many concurrent requests and as we don't have a DevOps team, we need to use a serverless stack so we just care of writting code. **The solution is explained at the end of the README**

This application has these requierements:

- Endpoint to authenticate users

```
POST /api/auth
-- Request --
{
  "username": string,
  "password": string
}
-- Response --
{
  "token": <a JWT token with the user ID>
}
```

- You don't need to create a users table, just fake the logic to return always a token for a given user, for example:

```
{
  "id": 1
}
```

- Endpoint to stake tokens with amount and period (number of months, e.g. 1, 3, 6, 12). This action will store the values in a SQL table and a counter in Redis (key the user)

```
POST /api/stake
-- Request --
{
  "amount": number,
  "period": number
}
-- Response --
{
  "success": boolean
}
```

- Endpoint to retrieve my stakes

```
GET /api/stake
-- Response --
{
  "items": [
    {
      "id": string | number, // up to you to define primary key
      "amount": number,
      "period": number
    }
  ]
}
```

(Feel free to add pagination if you want to query something like `/api/stake?page=1&limit=20`. Totally optional)

## Tech Stack

- Cloudflare worker for the API
- Serverless Redis (Upstash)
- Distributed SQL (CockroachDB)

All these SaaS have **free tiers**, so you won't need to pay anything for this project

## Solution

I have created 3 different endpoints using Hono, since I have seen that many people use it and it was much faster and easier to set up the routes.

The _/api/auth_ endpoint only accepts one username and password combination and always returns the same user ID encoded in the JWT token. If the username and password is correct than a new token is generated.

Every request to the other two endpoints must contain the token in the _Authrization_ header otherwise they cannot be accessed. This is handled by the _verifyJwt_ middleware.

I used the _postgres_ library to access the CockroachDB database. Given the simplicity of this assignment I wrote raw SQL queries which are easy to read.

As for the Redis part I did not really understand what do you exactly want me to implement so I just literally did what was described in the README. For the user id key I incremented its value for every stake insert.

Worker URL: https://stake-worker.bzalan65.workers.dev/
