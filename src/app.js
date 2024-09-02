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



export { app }