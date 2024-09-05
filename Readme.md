# VideoTube Backend

This is the backend for a YouTube-like application built using Node.js, Express, and MongoDB.

## Folder Structure

- **src**: Contains all the backend logic.
  - **db**: Handles database connections.
  - **models**: Defines database schemas.
  - **utils**: Contains utility functions.
  - **controllers**: Manages request handling logic.
  - **middlewares**: Custom middleware for request processing.
  - **routes**: API endpoints for interacting with the application.

## Key Files

### `app.js`

Sets up the Express app and includes middleware for:
- **CORS**: Allowing cross-origin requests.
- **Body parsing**: Handling JSON and URL-encoded data.
- **Static files**: Serving assets from the `public` directory.
- **Cookie parsing**: Reading cookies in requests.

### `constant.js`

Defines global constants:
- **DB_NAME**: The name of the MongoDB database, `"Videotube"`.

### `index.js`

Entry point of the application:
- Loads environment variables from `.env`.
- Connects to the MongoDB database using a custom `connectDB()` function.
- Starts the Express server on the specified `PORT`.

## Packages Used

- **bcrypt**: For password hashing and verification (`^5.1.1`).
- **cookie-parser**: To parse cookies in HTTP requests (`^1.4.6`).
- **cors**: Enables Cross-Origin Resource Sharing (`^2.8.5`).
- **dotenv**: Loads environment variables from a `.env` file (`^16.4.5`).
- **express**: Node.js web framework for building APIs (`^4.19.2`).
- **jsonwebtoken**: For generating and verifying JSON Web Tokens (JWT) (`^9.0.2`).
- **mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js (`^8.6.0`).
- **mongoose-aggregate-paginate-v2**: Adds pagination to Mongoose aggregation queries (`^1.1.2`).

## Setup

### Prerequisites

- Node.js
- MongoDB
- `.env` file with the following variables:
  ```env
  PORT
  MONGODB_URI
  CORS_ORIGIN
  ```
  
