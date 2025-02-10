import express from "express";
import { authUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

// ✅ Login Route
router.post("/auth", authUser);

// ✅ Register Route
router.post("/register", registerUser);

export default router;
