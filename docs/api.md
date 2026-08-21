# NexaChat API

Base URL: `https://frontend-task-chatapp.onrender.com/api`

## Log in or register

`POST /auth/login`

The endpoint logs in an existing phone number or creates a new account when the phone number is not registered.

### Request

```json
{
  "phone": "+15551234567",
  "name": "Ada Lovelace"
}
```

### Successful response

```json
{
  "token": "<jwt>",
  "user": {
    "_id": "6a883e75e5d6aac975220c48",
    "name": "Rasel",
    "phone": "01824842336",
    "createdAt": "2026-08-21T12:03:01.279Z"
  }
}
```

The frontend stores `token` in the `access_token` cookie. The shared Axios client reads that cookie before each request and sends it as:

```http
Authorization: Bearer <jwt>
```

The API documentation does not specify error response bodies. The frontend therefore displays the API's `message` field when available and falls back to a user-friendly generic error.

## Get the current user

`GET /auth/me`

Requires the JWT created by `/auth/login`:

```http
Authorization: Bearer <jwt>
```

The frontend calls this endpoint when the dashboard loads to validate the cookie session and hydrate the current user profile. Without the header, the API returns:

```json
{
  "error": {
    "message": "No token provided",
    "code": "NO_TOKEN"
  }
}
```