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

### Authentication Tokens :

### Access Token

- **Purpose**: An access token is used to authenticate a user’s request to access protected resources. It is a short-lived token that is included in the HTTP headers of requests to secure endpoints.
- **Expiry**: Typically has a short expiration time (e.g., 1 day) to minimize the impact of potential token leaks.
- **Usage**: Once issued upon user login or token refresh, it must be included in the `Authorization` header of subsequent requests to access restricted routes.

### Refresh Token

- **Purpose**: A refresh token is used to obtain a new access token once the current access token expires. It is a longer-lived token that is kept secure and is not exposed with every request.
- **Expiry**: Has a longer expiration time compared to the access token (e.g., 10 days) to allow users to stay logged in for extended periods without re-authenticating.
- **Usage**: Refresh tokens are stored securely (e.g., in HTTP-only cookies) and are sent to the server when the access token needs to be refreshed. They are then used to generate a new access token and, optionally, a new refresh token.

### Token Management

- **Access Token**: 
  - Issued upon successful authentication or token refresh.
  - Validates the user's session and grants access to protected routes.

- **Refresh Token**: 
  - Used to generate a new access token when the old one expires.
  - Stored securely to prevent unauthorized access.

### Workflow

1. **Login**:
   - User provides credentials.
   - Server verifies credentials and issues an access token and a refresh token.

2. **Access Token Usage**:
   - User includes the access token in the `Authorization` header for protected requests.
   - Server validates the token and grants or denies access to resources.

3. **Token Expiry**:
   - Once the access token expires, the user must use the refresh token to obtain a new access token.

4. **Token Refresh**:
   - User sends the refresh token to the server.
   - Server verifies the refresh token, generates a new access token, and possibly a new refresh token.
   - New tokens are sent back to the client, replacing the old ones.

5. **Logout**:
   - User requests to log out.
   - Server invalidates the refresh token and clears the cookies holding the tokens.

This approach ensures secure user sessions and limits the risk associated with token expiration and unauthorized access.

## MongoDB Aggregation Framework

### Overview

The MongoDB Aggregation Framework is a powerful tool for performing data processing and transformation directly within the database. Aggregation operations process data records and return computed results. The aggregation pipeline is a series of stages where each stage transforms the documents and passes the results to the next stage. The result is a modified document or an aggregated value.

Each stage in an aggregation pipeline performs a specific task, such as filtering documents (`$match`), joining collections (`$lookup`), adding new fields (`$addFields`), or projecting specific fields (`$project`).

### Aggregation Pipeline in `getUserChannelProfile`

The `getUserChannelProfile` function uses MongoDB's aggregation pipeline to fetch detailed information about a user channel. The pipeline processes the data from the `User` and `subscriptions` collections to retrieve the user’s channel profile along with subscription details. Below is an explanation of each stage used in the pipeline:

```javascript
const channel = await User.aggregate([
  {
    $match: {
      username: username?.toLowerCase() // Match the user by their username (case-insensitive)
    }
  },
  {
    $lookup: {
      from: "subscriptions", // Join with the "subscriptions" collection
      localField: "_id", // Local user ID
      foreignField: "channel", // Foreign field representing the subscription channel
      as: "subscribers" // Store results in the "subscribers" field
    }
  },
  {
    $lookup: {
      from: "subscriptions", // Another lookup on "subscriptions" collection
      localField: "_id", // Local user ID
      foreignField: "subscriber", // Foreign field representing the subscriber
      as: "subscribedTo" // Store results in the "subscribedTo" field
    }
  },
  {
    $addFields: {
      subscriberCount: {
        $size: "$subscribers" // Calculate the number of subscribers
      },
      ChannelSubscribedToCount: {
        $size: "$subscribedTo" // Calculate the number of channels the user is subscribed to
      },
      isSubscribed: {
        $cond: {
          if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // Check if the current user is in the subscriber list
          then: true,
          else: false
        }
      }
    }
  },
  {
    $project: {
      fullName: 1,
      username: 1,
      subscriberCount: 1,
      ChannelSubscribedToCount: 1,
      isSubscribed: 1,
      avatar: 1,
      coverImage: 1,
      email: 1 // Include only specific fields in the final output
    }
  }
])
```


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
  
