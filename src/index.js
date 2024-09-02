// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Load environment variables from .env file
dotenv.config({
    path: './env'  // Ensure this path is correct relative to your project structure
});



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Serve is run at port: ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("MongoDB connection error: ", error)
})


/*
import express from 'express'
const app = express();

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
        
    } catch (error) {
        console.log("Error: ", error)
        throw error
    }
} )()
*/