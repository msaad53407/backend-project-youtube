import { Router } from "express";
import { loginHandler, registerHandler } from "../controllers/user.controller";

const router = Router();

router.route('/register').post(registerHandler);
// router.route('/hello').get((req, res) => {
//     res.json({ message: 'Hello World' });
// })

export default router;