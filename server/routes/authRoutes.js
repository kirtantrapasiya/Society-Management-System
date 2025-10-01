import express from "express";
import { registerUser, getProfile } from "../controllers/authController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/profile", verifyAuth, getProfile);

export default router;
