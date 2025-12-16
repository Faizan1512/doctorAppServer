import { Router } from "express";
import { register, login } from "../middleware/register.middleware.js";
const router = Router();

router.post("/register", register);

router.post("/login", login);

export default router;
