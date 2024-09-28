import { Router } from "express";
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage
} from "../controllers/user.controller.js";
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

    // **secured routes**

// First, verifyJWT middleware is executed. If successful, it calls next(), allowing the request to proceed to logoutUser
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").post(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("history").get(verifyJWT, getWatchHistory)

export default router
