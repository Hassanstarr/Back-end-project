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

### `user.model.js`

Defines the schema for user data:
- **username**: Unique identifier for users.
- **email**: User's email address.
- **fullName**: Full name of the user.
- **avatar**: URL to the user's avatar image.
- **coverImage**: URL to the user's cover image (optional).
- **watchHistory**: List of videos watched by the user.
- **password**: User's hashed password.
- **refreshToken**: Token used to generate new access tokens.

Includes methods for:
- Hashing passwords before saving.
- Comparing passwords.
- Generating access and refresh tokens.

### `video.model.js`

Defines the schema for video data:
- **videoFile**: URL to the video file.
- **thumbnail**: URL to the video's thumbnail image.
- **title**: Title of the video.
- **description**: Description of the video.
- **duration**: Duration of the video.
- **isPublished**: Indicates whether the video is published.
- **owner**: Reference to the user who uploaded the video.

Includes pagination for handling large amounts of data.

### `middlewares/multer.middleware.js` and `auth.middleware.js`

**`multer.middleware.js`**:
- **Purpose**: Configures Multer to handle file uploads.
- **Storage Configuration**:
  - **`destination`**: Sets the directory (`./public/temp`) where uploaded files are temporarily stored.
  - **`filename`**: Defines the name of the uploaded file, preserving the original name.
- **`upload` Middleware**:
  - **`upload.fields`**: Manages file uploads for multiple fields (e.g., `avatar`, `coverImage`), with specified maximum file counts per field.

**`auth.middleware.js`**:
- **Purpose**: Provides authentication functionality using JWT.
- **JWT Verification**:
  - **`verifyJWT`**: Middleware that checks the validity of JWTs in requests to ensure users are authenticated before accessing protected routes.

### `controllers/user.controller.js`

**User Controller Actions**:
- **`registerUser`**:
  - **Purpose**: Handles user registration by validating input fields and managing file uploads.
  - **Avatar and Cover Image Handling**: Uploads avatar and cover images to Cloudinary, updating user records with the corresponding image URLs.
  
- **`loginUser`**:
  - **Purpose**: Authenticates users by verifying credentials and generating access and refresh tokens.
  - **Token Management**: Issues JWT access and refresh tokens, and sets them in cookies for session management.

- **`logoutUser`**:
  - **Purpose**: Logs out users by removing JWT tokens from cookies and clearing the refresh token from the user's record.
  - **Session Management**: Ensures the user’s session is fully terminated by clearing all related cookies.

- **`refreshAccessToken`**:
  - **Purpose**: Refreshes the access token using a valid refresh token provided in cookies or the request body.
  - **Token Verification**: Verifies the provided refresh token and generates new access and refresh tokens if valid.
  - **Session Management**: Updates the cookies with new tokens and ensures the previous refresh token is invalidated.


## Packages Used

- **bcrypt**: For password hashing and verification (`^5.1.1`).
- **cookie-parser**: To parse cookies in HTTP requests (`^1.4.6`).
- **cors**: Enables Cross-Origin Resource Sharing (`^2.8.5`).
- **dotenv**: Loads environment variables from a `.env` file (`^16.4.5`).
- **express**: Node.js web framework for building APIs (`^4.19.2`).
- **jsonwebtoken**: For generating and verifying JSON Web Tokens (JWT) (`^9.0.2`).
- **mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js (`^8.6.0`).
- **mongoose-aggregate-paginate-v2**: Adds pagination to Mongoose aggregation queries (`^1.1.2`).
- **multer**: Middleware for handling file uploads (`^1.4.5-lts.1`).

## Handling Cookies and Request Body in Express.js

In a typical Express.js application, you may receive data from the client in different formats, such as cookies or the request body. This README explains how to handle both `req.cookies` and `req.body`.

### `req.cookies`

- `req.cookies` contains cookies that are sent by the client (browser or mobile app) with each request.
- Cookies are small pieces of data stored on the client side, typically set by the server using the `Set-Cookie` header.
- The client automatically sends cookies in subsequent requests, and you can access them using `req.cookies`.

### `req.body`

- **`req.body`** contains the data sent by the client in the **body of an HTTP request**, typically in a POST, PUT, or PATCH request.
- This is commonly used when submitting form data, sending JSON payloads, or uploading files.
- Unlike cookies, data in the body is explicitly sent by the client on each request.


## Setup

### Prerequisites

- **Node.js**: The runtime environment for executing JavaScript code on the server.
- **MongoDB**: The NoSQL database used for storing user data and other resources.
- **Cloudinary**: Required for handling file uploads (avatars, cover images).
- **Environment Variables**: A `.env` file should be set up with the following variables:
  ```env
  PORT
  MONGODB_URI
  CORS_ORIGIN
  ACCESS_TOKEN_SECRET
  ACCESS_TOKEN_EXPIRY
  REFRESH_TOKEN_SECRET
  REFRESH_TOKEN_EXPIRY
  CLOUDINARY_CLOUD_NAME
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET
  ```
  
