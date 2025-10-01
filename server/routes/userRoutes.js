import express from "express";
import { getAllUsers, updateUserRole, deleteUser } from "../controllers/userController.js";
import { verifyAuth, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only secretary can access these routes
router.get("/", verifyAuth, checkRole(["secretary"]), getAllUsers);
router.put("/role", verifyAuth, checkRole(["secretary"]), updateUserRole);
router.delete("/:uid", verifyAuth, checkRole(["secretary"]), deleteUser);

export default router;
