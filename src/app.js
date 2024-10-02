import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";

const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Parse incoming JSON requests and limit the body size to 16kb
app.use(express.json({ limit: "16kb" }));

// Parse incoming URL-encoded data with extended option and limit the body size to 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files (e.g., images, CSS, JavaScript) from the "public" directory
app.use(express.static("public"));

// Parse cookies attached to the client request object
app.use(cookieParser());


// Routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"


// Routes declaration
app.use("/api/v1/users", userRouter)    // http://localhost:5000/api/v1/users/register
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)



export { app }