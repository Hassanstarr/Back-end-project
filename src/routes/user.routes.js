import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js";
import { verifyJWT } from "../middlewares/auth.middlerware.js";


const router = Router()

// The upload.fields middleware is used to handle multiple file uploads
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1 // Upload a single avatar image
        },
        {
            name: "coverImage",
            maxCount: 1 // Upload a single cover image
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secured routes

// First, verifyJWT middleware is executed. If successful, it calls next(), allowing the request to proceed to logoutUser
router.route("/logout").post(verifyJWT, logoutUser)


export default router
