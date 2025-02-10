// routes/categoryRoutes.js
import express from "express";
import { getCategories, createCategory, deleteCategory , updateCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);
router.put("/categories/:id", updateCategory);

export default router;
