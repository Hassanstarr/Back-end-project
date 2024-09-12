import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

export default router




// import { Router } from 'express';

// // import all controllers
// // import SessionController from './app/controllers/SessionController';

// const routes = new Router();

// // Add routes
// // routes.get('/', SessionController.store);
// // routes.post('/', SessionController.store);
// // routes.put('/', SessionController.store);
// // routes.delete('/', SessionController.store);

// module.exports = routes;
