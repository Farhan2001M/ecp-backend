import express from "express";
import { authUser } from "../controllers/authController.js";
import { createCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.post("/auth", authUser);
router.post("/categories", createCategory);

export default router;
