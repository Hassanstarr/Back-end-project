import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

router.route("register").post(registerUser)

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
